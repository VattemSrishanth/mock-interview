package com.intervai.service;

import com.intervai.dto.TtsPersonaDto;
import com.intervai.dto.TtsRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TtsServiceTest {

    private TtsService ttsService;

    @BeforeEach
    void setUp() {
        ttsService = new TtsService();
    }

    @Test
    void getAvailablePersonas_ReturnsAllConfiguredPersonas() {
        List<TtsPersonaDto> personas = ttsService.getAvailablePersonas();
        assertNotNull(personas);
        assertEquals(4, personas.size());

        assertTrue(personas.stream().anyMatch(p -> p.getId().equals("sarah")));
        assertTrue(personas.stream().anyMatch(p -> p.getId().equals("james")));
        assertTrue(personas.stream().anyMatch(p -> p.getId().equals("elena")));
        assertTrue(personas.stream().anyMatch(p -> p.getId().equals("alex")));
    }

    @Test
    void synthesizeSpeech_WhenNoApiKey_ReturnsNullGracefully() {
        TtsRequest request = TtsRequest.builder()
                .text("Test question")
                .persona("sarah")
                .build();

        byte[] result = ttsService.synthesizeSpeech(request);
        assertNull(result);
    }
}

