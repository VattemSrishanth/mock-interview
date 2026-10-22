package com.intervai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.CodeExecutionRequest;
import com.intervai.dto.CodeExecutionResponse;
import com.intervai.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

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

        // Execution might succeed or timeout if network offline, but must not crash
        CodeExecutionResponse response = service.executeCode(jsReq);
        assertNotNull(response);
        assertEquals("javascript", response.getLanguage());
        assertNotNull(response.getStatus());
    }
}

