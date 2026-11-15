package com.intervai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.CodeExecutionRequest;
import com.intervai.dto.CodeExecutionResponse;
import com.intervai.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class CodeExecutionService {

    private static final String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
    private static final Map<String, String> LANGUAGE_MAP = Map.ofEntries(
            Map.entry("python", "python"),
            Map.entry("py", "python"),
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
    private final boolean localFallbackEnabled;

    private static String RESOLVED_PYTHON_CMD = null;

    public CodeExecutionService(ObjectMapper objectMapper) {
        this(objectMapper, createDefaultRestTemplate(), true);
    }

    @Autowired
    public CodeExecutionService(
            ObjectMapper objectMapper,
            @Value("${app.code-execution.local-fallback-enabled:true}") boolean localFallbackEnabled) {
        this(objectMapper, createDefaultRestTemplate(), localFallbackEnabled);
    }

    public CodeExecutionService(ObjectMapper objectMapper, RestTemplate restTemplate, boolean localFallbackEnabled) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
        this.localFallbackEnabled = localFallbackEnabled;
    }

    private static RestTemplate createDefaultRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4000);  // 4s connect timeout
        factory.setReadTimeout(8000);     // 8s execution timeout
        return new RestTemplate(factory);
    }

    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        if (!StringUtils.hasText(request.getCode())) {
            throw new BadRequestException("Code snippet cannot be empty");
        }

        String rawLang = request.getLanguage().toLowerCase(Locale.ROOT).trim();
        String normalizedLanguage = LANGUAGE_MAP.getOrDefault(rawLang, rawLang);
        long startTime = System.currentTimeMillis();

        // 1. Direct local execution for natively supported languages (sub-100ms response time)
        if (localFallbackEnabled && isLocallySupported(normalizedLanguage)) {
            CodeExecutionResponse localRes = executeLocally(normalizedLanguage, request.getCode(), request.getStdin());
            if (localRes != null) {
                return localRes;
            }
        }

        // 2. If remote sandbox is available, attempt remote Piston execution
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
            log.warn("Remote code sandbox unavailable ({}). Attempting local runtime fallback.", e.getMessage());

            if (localFallbackEnabled) {
                CodeExecutionResponse localRes = executeLocally(normalizedLanguage, request.getCode(), request.getStdin());
                if (localRes != null) {
                    return localRes;
                }
            }

            String message;
            if (!localFallbackEnabled) {
                message = "Remote code execution sandbox is currently unavailable and host execution fallback is disabled.";
            } else if ("c++".equals(normalizedLanguage) || "cpp".equals(normalizedLanguage)) {
                message = "C++ compiler (g++) is not configured in this sandbox environment.\nSupported compilers: Python 3.12, JavaScript (Node.js), TypeScript, and Java 21.";
            } else if ("go".equals(normalizedLanguage)) {
                message = "Go compiler is not configured in this sandbox environment.\nSupported compilers: Python 3.12, JavaScript (Node.js), TypeScript, and Java 21.";
            } else {
                message = "Code execution engine error: " + e.getMessage() + "\nPlease review your code syntax or retry in a moment.";
            }

            return CodeExecutionResponse.builder()
                    .language(normalizedLanguage)
                    .version("standard")
                    .stdout("")
                    .stderr(message)
                    .output(message)
                    .exitCode(1)
                    .executionTimeMs(elapsed)
                    .status("ERROR")
                    .build();
        }
    }

    private boolean isLocallySupported(String language) {
        return "python".equals(language) || "javascript".equals(language)
                || "typescript".equals(language) || "java".equals(language);
    }

    private CodeExecutionResponse executeLocally(String language, String code, String stdin) {
        long start = System.currentTimeMillis();
        Path tempDir = null;

        try {
            tempDir = Files.createTempDirectory("intervai_sandbox_");
            String fileName;
            List<String> command;
            String versionLabel;

            switch (language.toLowerCase(Locale.ROOT)) {
                case "python":
                    fileName = "solution.py";
                    String pyCmd = resolvePythonCommand();
                    command = List.of(pyCmd, "-u", fileName);
                    versionLabel = "Python (Local Engine)";
                    break;

                case "javascript":
                    fileName = "solution.js";
                    command = List.of("node", fileName);
                    versionLabel = "JavaScript (Node.js Local)";
                    break;

                case "typescript":
                    fileName = "solution.ts";
                    command = List.of("node", "--experimental-strip-types", fileName);
                    versionLabel = "TypeScript (Node.js Local)";
                    break;

                case "java":
                    String className = extractJavaClassName(code);
                    fileName = className + ".java";
                    Path javaFile = tempDir.resolve(fileName);
                    Files.writeString(javaFile, code, StandardCharsets.UTF_8);

                    ProcessBuilder compilePb = new ProcessBuilder("javac", fileName);
                    compilePb.directory(tempDir.toFile());
                    Process compileProc = compilePb.start();
                    boolean compDone = compileProc.waitFor(8, TimeUnit.SECONDS);

                    if (!compDone || compileProc.exitValue() != 0) {
                        String compErr = new String(compileProc.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                        return CodeExecutionResponse.builder()
                                .language("java")
                                .version("Java 21 (OpenJDK)")
                                .stdout("")
                                .stderr(compErr)
                                .output(compErr)
                                .exitCode(compileProc.exitValue() != 0 ? compileProc.exitValue() : 1)
                                .executionTimeMs(System.currentTimeMillis() - start)
                                .status("COMPILE_ERROR")
                                .build();
                    }

                    command = List.of("java", className);
                    versionLabel = "Java 21 (OpenJDK)";
                    break;

                default:
                    return null;
            }

            if (!"java".equals(language)) {
                Path sourceFile = tempDir.resolve(fileName);
                Files.writeString(sourceFile, code, StandardCharsets.UTF_8);
            }

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.directory(tempDir.toFile());
            Process process = pb.start();

            // Feed stdin if provided
            if (StringUtils.hasText(stdin)) {
                try (var os = process.getOutputStream()) {
                    os.write(stdin.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            boolean finished = process.waitFor(8, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return CodeExecutionResponse.builder()
                        .language(language)
                        .version(versionLabel)
                        .stdout("")
                        .stderr("Execution timed out after 8000ms")
                        .output("Timed Out (8s limit exceeded)")
                        .exitCode(124)
                        .executionTimeMs(System.currentTimeMillis() - start)
                        .status("TIMEOUT")
                        .build();
            }

            String stdout = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            String stderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            int exitCode = process.exitValue();
            String output = StringUtils.hasText(stderr) ? (StringUtils.hasText(stdout) ? stdout + "\n" + stderr : stderr) : stdout;
            String status = exitCode == 0 ? "SUCCESS" : "RUNTIME_ERROR";

            return CodeExecutionResponse.builder()
                    .language(language)
                    .version(versionLabel)
                    .stdout(stdout)
                    .stderr(stderr)
                    .output(output)
                    .exitCode(exitCode)
                    .executionTimeMs(System.currentTimeMillis() - start)
                    .status(status)
                    .build();

        } catch (Exception ex) {
            log.error("Local sandbox execution failed: {}", ex.getMessage(), ex);
            return null;
        } finally {
            if (tempDir != null) {
                try {
                    org.springframework.util.FileSystemUtils.deleteRecursively(tempDir);
                } catch (Exception ignored) {}
            }
        }
    }

    private String extractJavaClassName(String code) {
        if (code == null || code.isBlank()) return "Main";
        Matcher publicMatcher = Pattern.compile("public\\s+class\\s+([A-Za-z0-9_]+)").matcher(code);
        if (publicMatcher.find()) {
            return publicMatcher.group(1);
        }
        Matcher classMatcher = Pattern.compile("class\\s+([A-Za-z0-9_]+)").matcher(code);
        if (classMatcher.find()) {
            return classMatcher.group(1);
        }
        return "Main";
    }

    private static synchronized String resolvePythonCommand() {
        if (RESOLVED_PYTHON_CMD != null) {
            return RESOLVED_PYTHON_CMD;
        }
        try {
            Process p = new ProcessBuilder("python", "--version").start();
            if (p.waitFor(2, TimeUnit.SECONDS) && p.exitValue() == 0) {
                RESOLVED_PYTHON_CMD = "python";
                return RESOLVED_PYTHON_CMD;
            }
        } catch (Exception ignored) {}

        try {
            Process p = new ProcessBuilder("python3", "--version").start();
            if (p.waitFor(2, TimeUnit.SECONDS) && p.exitValue() == 0) {
                RESOLVED_PYTHON_CMD = "python3";
                return RESOLVED_PYTHON_CMD;
            }
        } catch (Exception ignored) {}

        RESOLVED_PYTHON_CMD = "python";
        return RESOLVED_PYTHON_CMD;
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
