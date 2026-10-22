package com.intervai.service;

import com.intervai.dto.TtsPersonaDto;
import com.intervai.dto.TtsRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TtsService {

    private static final String OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";

    @Value("${app.openai.api-key:}")
    private String openAiApiKey;

    private final RestTemplate restTemplate;
    private final Map<String, byte[]> audioCache = new ConcurrentHashMap<>();

    private static final List<TtsPersonaDto> PERSONAS = List.of(
            TtsPersonaDto.builder()
                    .id("sarah")
                    .name("Sarah")
                    .title("Senior Tech Lead")
                    .accent("US / American")
                    .gender("Female")
                    .description("Conversational, clear, and structured technical interviewer.")
                    .previewText("Hello! I am Sarah, your technical interviewer. Let's explore your problem-solving process.")
                    .cloudVoice("nova")
                    .defaultPitch(1.0)
                    .defaultRate(0.95)
                    .build(),
            TtsPersonaDto.builder()
                    .id("james")
                    .name("James")
                    .title("Staff Infrastructure Architect")
                    .accent("UK / British")
                    .gender("Male")
                    .description("Analytical, rigorous, probing deep system trade-offs and edge cases.")
                    .previewText("Good day. I am James. We'll be walking through systems architecture and algorithmic resilience.")
                    .cloudVoice("onyx")
                    .defaultPitch(0.95)
                    .defaultRate(0.92)
                    .build(),
            TtsPersonaDto.builder()
                    .id("elena")
                    .name("Elena")
                    .title("VP of Engineering")
                    .accent("US / American")
                    .gender("Female")
                    .description("Strategic and encouraging, focusing on leadership, architecture, and team outcomes.")
                    .previewText("Welcome! I am Elena. I am excited to discuss how you structure complex applications and collaborate.")
                    .cloudVoice("shimmer")
                    .defaultPitch(1.05)
                    .defaultRate(0.98)
                    .build(),
            TtsPersonaDto.builder()
                    .id("alex")
                    .name("Alex")
                    .title("Distributed Systems Principal")
                    .accent("US / American")
                    .gender("Male")
                    .description("Direct, pragmatic, and focused on production reliability and performance.")
                    .previewText("Hi there, I am Alex. Let's dive right into implementation details, concurrency, and telemetry.")
                    .cloudVoice("echo")
                    .defaultPitch(0.90)
                    .defaultRate(1.00)
                    .build()
    );

    public TtsService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
    }

    public List<TtsPersonaDto> getAvailablePersonas() {
        return PERSONAS;
    }

    public boolean isCloudTtsEnabled() {
        return StringUtils.hasText(openAiApiKey);
    }

    public byte[] synthesizeSpeech(TtsRequest request) {
        if (!isCloudTtsEnabled()) {
            log.debug("Cloud TTS is not configured (no OPENAI_API_KEY). Client will use Enhanced Natural Persona TTS.");
            return null;
        }

        if (!StringUtils.hasText(request.getText())) {
            return null;
        }

        // Map persona to voice if needed
        String voice = request.getVoice();
        if (!StringUtils.hasText(voice) || "alloy".equalsIgnoreCase(voice)) {
            String personaId = request.getPersona() != null ? request.getPersona().toLowerCase(Locale.ROOT) : "sarah";
            voice = PERSONAS.stream()
                    .filter(p -> p.getId().equalsIgnoreCase(personaId))
                    .map(TtsPersonaDto::getCloudVoice)
                    .findFirst()
                    .orElse("nova");
        }

        String cacheKey = voice + ":" + request.getSpeed() + ":" + request.getText().trim();
        if (audioCache.containsKey(cacheKey)) {
            return audioCache.get(cacheKey);
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", "tts-1");
            payload.put("input", request.getText());
            payload.put("voice", voice);
            payload.put("speed", request.getSpeed() != null ? request.getSpeed() : 1.0);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey.trim());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<byte[]> response = restTemplate.exchange(OPENAI_TTS_URL, HttpMethod.POST, entity, byte[].class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Cache limited audio items
                if (audioCache.size() < 100) {
                    audioCache.put(cacheKey, response.getBody());
                }
                return response.getBody();
            }

        } catch (Exception ex) {
            log.warn("Cloud TTS synthesis call failed (falling back to client natural voice engine): {}", ex.getMessage());
        }

        return null;
    }
}

