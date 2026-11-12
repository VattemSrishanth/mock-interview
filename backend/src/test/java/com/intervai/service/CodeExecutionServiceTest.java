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
}

