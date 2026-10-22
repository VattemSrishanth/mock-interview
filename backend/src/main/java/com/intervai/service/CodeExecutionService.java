package com.intervai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.CodeExecutionRequest;
import com.intervai.dto.CodeExecutionResponse;
import com.intervai.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class CodeExecutionService {

    private static final String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
    private static final Map<String, String> LANGUAGE_MAP = Map.ofEntries(
            Map.entry("python", "python"),
            Map.entry("javascript", "javascript"),
            Map.entry("js", "javascript"),
            Map.entry("typescript", "typescript"),
            Map.entry("ts", "typescript"),
            Map.entry("java", "java"),
            Map.entry("cpp", "c++"),
            Map.entry("c++", "c++"),
            Map.entry("c", "c"),
            Map.entry("go", "go"),
            Map.entry("golang", "go")
    );

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public CodeExecutionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);  // 8s connect timeout
        factory.setReadTimeout(15000);    // 15s execution timeout
        this.restTemplate = new RestTemplate(factory);
    }

    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        if (!StringUtils.hasText(request.getCode())) {
            throw new BadRequestException("Code snippet cannot be empty");
        }

        String rawLang = request.getLanguage().toLowerCase(Locale.ROOT).trim();
        String normalizedLanguage = LANGUAGE_MAP.getOrDefault(rawLang, rawLang);

        long startTime = System.currentTimeMillis();

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("language", normalizedLanguage);
            payload.put("version", "*");
            payload.put("files", List.of(Map.of("content", request.getCode())));
            payload.put("stdin", request.getStdin() != null ? request.getStdin() : "");
            payload.put("run_timeout", 8000);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.set(HttpHeaders.USER_AGENT, "IntervAI-CodeSandbox/1.0");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.exchange(PISTON_API_URL, HttpMethod.POST, entity, String.class);

            long elapsed = System.currentTimeMillis() - startTime;
            return parsePistonResponse(response.getBody(), normalizedLanguage, elapsed);

        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.warn("Remote Piston execution unavailable or whitelisted ({}). Engaging local execution engine.", e.getMessage());

            // Fallback to local sandbox execution for installed runtimes (Python, Node.js, Java)
            CodeExecutionResponse localRes = executeLocally(normalizedLanguage, request.getCode(), request.getStdin());
            if (localRes != null) {
                return localRes;
            }

            return CodeExecutionResponse.builder()
                    .language(normalizedLanguage)
                    .version("standard")
                    .stdout("")
                    .stderr("Execution engine unavailable: " + e.getMessage() + "\nPlease review your code syntax or retry in a moment.")
                    .output("Execution service error: " + e.getMessage())
                    .exitCode(1)
                    .executionTimeMs(elapsed)
                    .status("ERROR")
                    .build();
        }
    }

    private CodeExecutionResponse executeLocally(String language, String code, String stdin) {
        long start = System.currentTimeMillis();
        java.nio.file.Path tempDir = null;
        try {
            tempDir = java.nio.file.Files.createTempDirectory("intervai_sandbox_");
            String fileName;
            List<String> command;

            switch (language.toLowerCase(Locale.ROOT)) {
                case "python":
                    fileName = "solution.py";
                    command = List.of("python", fileName);
                    break;
                case "javascript":
                case "typescript":
                    fileName = "solution.js";
                    command = List.of("node", fileName);
                    break;
                case "java":
                    fileName = "Main.java";
                    // For Java, we compile first then run
                    java.nio.file.Path javaFile = tempDir.resolve(fileName);
                    java.nio.file.Files.writeString(javaFile, code);
                    
                    ProcessBuilder compilePb = new ProcessBuilder("javac", fileName);
                    compilePb.directory(tempDir.toFile());
                    Process compileProc = compilePb.start();
                    boolean compDone = compileProc.waitFor(8, java.util.concurrent.TimeUnit.SECONDS);
                    if (!compDone || compileProc.exitValue() != 0) {
                        String compErr = new String(compileProc.getErrorStream().readAllBytes());
                        return CodeExecutionResponse.builder()
                                .language("java")
                                .version("Java 21 Local")
                                .stdout("")
                                .stderr(compErr)
                                .output(compErr)
                                .exitCode(compileProc.exitValue())
                                .executionTimeMs(System.currentTimeMillis() - start)
                                .status("COMPILE_ERROR")
                                .build();
                    }
                    command = List.of("java", "Main");
                    break;
                default:
                    return null; // Not supported locally without compiler installed
            }

            if (!"java".equals(language)) {
                java.nio.file.Path sourceFile = tempDir.resolve(fileName);
                java.nio.file.Files.writeString(sourceFile, code);
            }

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.directory(tempDir.toFile());
            Process process = pb.start();

            // Pipe stdin if provided
            if (StringUtils.hasText(stdin)) {
                try (var os = process.getOutputStream()) {
                    os.write(stdin.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    os.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            boolean finished = process.waitFor(8, java.util.concurrent.TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return CodeExecutionResponse.builder()
                        .language(language)
                        .version("Local Runtime")
                        .stdout("")
                        .stderr("Execution timed out after 8000ms")
                        .output("Timed Out")
                        .exitCode(124)
                        .executionTimeMs(System.currentTimeMillis() - start)
                        .status("TIMEOUT")
                        .build();
            }

            String stdout = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            String stderr = new String(process.getErrorStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            int exitCode = process.exitValue();
            String output = StringUtils.hasText(stderr) ? (StringUtils.hasText(stdout) ? stdout + "\n" + stderr : stderr) : stdout;
            String status = exitCode == 0 ? "SUCCESS" : "RUNTIME_ERROR";

            return CodeExecutionResponse.builder()
                    .language(language)
                    .version("Local Engine")
                    .stdout(stdout)
                    .stderr(stderr)
                    .output(output)
                    .exitCode(exitCode)
                    .executionTimeMs(System.currentTimeMillis() - start)
                    .status(status)
                    .build();

        } catch (Exception ex) {
            log.error("Local sandbox execution failed", ex);
            return null;
        } finally {
            if (tempDir != null) {
                try {
                    org.springframework.util.FileSystemUtils.deleteRecursively(tempDir);
                } catch (Exception ignored) {}
            }
        }
    }

    private CodeExecutionResponse parsePistonResponse(String responseBody, String language, long elapsed) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String lang = root.path("language").asText(language);
            String ver = root.path("version").asText("standard");

            JsonNode compileNode = root.path("compile");
            if (!compileNode.isMissingNode() && !compileNode.isNull()) {
                int compileCode = compileNode.path("code").asInt(0);
                if (compileCode != 0) {
                    String compileErr = compileNode.path("stderr").asText(compileNode.path("output").asText());
                    return CodeExecutionResponse.builder()
                            .language(lang)
                            .version(ver)
                            .stdout(compileNode.path("stdout").asText(""))
                            .stderr(compileErr)
                            .output(compileNode.path("output").asText())
                            .exitCode(compileCode)
                            .executionTimeMs(elapsed)
                            .status("COMPILE_ERROR")
                            .build();
                }
            }

            JsonNode runNode = root.path("run");
            int exitCode = runNode.path("code").asInt(0);
            String stdout = runNode.path("stdout").asText("");
            String stderr = runNode.path("stderr").asText("");
            String output = runNode.path("output").asText("");

            String status = exitCode == 0 ? "SUCCESS" : "RUNTIME_ERROR";

            return CodeExecutionResponse.builder()
                    .language(lang)
                    .version(ver)
                    .stdout(stdout)
                    .stderr(stderr)
                    .output(output)
                    .exitCode(exitCode)
                    .executionTimeMs(elapsed)
                    .status(status)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse code execution response", e);
            return CodeExecutionResponse.builder()
                    .language(language)
                    .version("standard")
                    .stdout("")
                    .stderr("Failed to parse execution output: " + e.getMessage())
                    .output(responseBody)
                    .exitCode(1)
                    .executionTimeMs(elapsed)
                    .status("ERROR")
                    .build();
        }
    }
}
