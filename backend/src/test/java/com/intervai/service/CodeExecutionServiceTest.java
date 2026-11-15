package com.intervai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.CodeExecutionRequest;
import com.intervai.dto.CodeExecutionResponse;
import com.intervai.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CodeExecutionServiceTest {

    private CodeExecutionService service;

    @BeforeEach
    void setUp() {
        service = new CodeExecutionService(new ObjectMapper());
    }

    @Test
    void rejectsEmptyCodeSnippet() {
        CodeExecutionRequest emptyReq = CodeExecutionRequest.builder()
                .language("python")
                .code("   ")
                .build();

        assertThrows(BadRequestException.class, () -> service.executeCode(emptyReq));
    }

    @Test
    void normalizesLanguageNames() {
        CodeExecutionRequest jsReq = CodeExecutionRequest.builder()
                .language("js")
                .code("console.log('hello');")
                .build();

        // Execution might succeed or return ERROR if remote sandbox unavailable, but must not crash
        CodeExecutionResponse response = service.executeCode(jsReq);
        assertNotNull(response);
        assertEquals("javascript", response.getLanguage());
        assertNotNull(response.getStatus());
    }

    @Test
    void disablesHostExecutionFallbackByDefaultWhenRemoteSandboxFails() {
        RestTemplate failingRestTemplate = mock(RestTemplate.class);
        when(failingRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RestClientException("401 Whitelist only"));

        CodeExecutionService sandboxedService = new CodeExecutionService(new ObjectMapper(), failingRestTemplate, false);
        CodeExecutionRequest pythonReq = CodeExecutionRequest.builder()
                .language("python")
                .code("print('should not run on host')")
                .build();

        CodeExecutionResponse response = sandboxedService.executeCode(pythonReq);
        assertEquals("ERROR", response.getStatus());
        assertEquals(1, response.getExitCode());
        assertTrue(response.getStderr().contains("host execution fallback is disabled"));
    }

    @Test
    void executesPythonLocallyAndCapturesStdout() {
        CodeExecutionRequest req = CodeExecutionRequest.builder()
                .language("python")
                .code("print('Antigravity Python Sandbox OK')")
                .build();

        CodeExecutionResponse response = service.executeCode(req);
        assertNotNull(response);
        assertEquals("python", response.getLanguage());
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(0, response.getExitCode());
        assertTrue(response.getStdout().contains("Antigravity Python Sandbox OK"));
    }

    @Test
    void executesJavaScriptLocallyAndCapturesStdout() {
        CodeExecutionRequest req = CodeExecutionRequest.builder()
                .language("javascript")
                .code("console.log('Antigravity JS Sandbox OK');")
                .build();

        CodeExecutionResponse response = service.executeCode(req);
        assertNotNull(response);
        assertEquals("javascript", response.getLanguage());
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(0, response.getExitCode());
        assertTrue(response.getStdout().contains("Antigravity JS Sandbox OK"));
    }

    @Test
    void executesTypeScriptLocallyAndCapturesStdout() {
        CodeExecutionRequest req = CodeExecutionRequest.builder()
                .language("typescript")
                .code("const msg: string = 'Antigravity TS Sandbox OK'; console.log(msg);")
                .build();

        CodeExecutionResponse response = service.executeCode(req);
        assertNotNull(response);
        assertEquals("typescript", response.getLanguage());
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(0, response.getExitCode());
        assertTrue(response.getStdout().contains("Antigravity TS Sandbox OK"));
    }

    @Test
    void executesJavaLocallyAndCapturesStdout() {
        String javaCode = """
                public class Solution {
                    public static void main(String[] args) {
                        System.out.println("Antigravity Java Sandbox OK");
                    }
                }
                """;

        CodeExecutionRequest req = CodeExecutionRequest.builder()
                .language("java")
                .code(javaCode)
                .build();

        CodeExecutionResponse response = service.executeCode(req);
        assertNotNull(response);
        assertEquals("java", response.getLanguage());
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(0, response.getExitCode());
        assertTrue(response.getStdout().contains("Antigravity Java Sandbox OK"));
    }

    @Test
    void reportsJavaCompilationErrorWithDiagnostic() {
        String brokenJava = """
                public class Solution {
                    public static void main(String[] args) {
                        brokenSyntaxDoesNotExist();
                    }
                }
                """;

        CodeExecutionRequest req = CodeExecutionRequest.builder()
                .language("java")
                .code(brokenJava)
                .build();

        CodeExecutionResponse response = service.executeCode(req);
        assertNotNull(response);
        assertEquals("java", response.getLanguage());
        assertEquals("COMPILE_ERROR", response.getStatus());
        assertNotEquals(0, response.getExitCode());
        assertTrue(response.getStderr().contains("cannot find symbol"));
    }

    @Test
    void passesStdinToProcess() {
        CodeExecutionRequest req = CodeExecutionRequest.builder()
                .language("python")
                .code("import sys; line = sys.stdin.readline().strip(); print(f'ECHO: {line}')")
                .stdin("Hello IntervAI")
                .build();

        CodeExecutionResponse response = service.executeCode(req);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(0, response.getExitCode());
        assertTrue(response.getStdout().contains("ECHO: Hello IntervAI"));
    }
}

