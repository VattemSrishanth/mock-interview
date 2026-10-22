package com.intervai.controller;

import com.intervai.dto.TtsPersonaDto;
import com.intervai.dto.TtsRequest;
import com.intervai.service.TtsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tts")
@RequiredArgsConstructor
@Slf4j
public class TtsController {

    private final TtsService ttsService;

    @GetMapping("/personas")
    public ResponseEntity<Map<String, Object>> getPersonas() {
        List<TtsPersonaDto> personas = ttsService.getAvailablePersonas();
        boolean cloudEnabled = ttsService.isCloudTtsEnabled();
        return ResponseEntity.ok(Map.of(
                "personas", personas,
                "cloudTtsEnabled", cloudEnabled
        ));
    }

    @PostMapping("/synthesize")
    public ResponseEntity<?> synthesizeSpeech(@Valid @RequestBody TtsRequest request) {
        byte[] audioData = ttsService.synthesizeSpeech(request);

        if (audioData != null && audioData.length > 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
            headers.setContentLength(audioData.length);
            headers.setCacheControl(CacheControl.noCache().getHeaderValue());
            return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
        }

        // Return informative fallback directive for client-side enhanced persona speech
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "status", "CLIENT_NATURAL_VOICE_FALLBACK",
                "message", "Cloud TTS unavailable or not configured. Use enhanced browser persona synthesizer.",
                "persona", request.getPersona() != null ? request.getPersona() : "sarah"
        ));
    }
}

