package com.intervai.controller;

import com.intervai.dto.AiCoachRequest;
import com.intervai.dto.AiCoachResponse;
import com.intervai.dto.UserDto;
import com.intervai.security.UserPrincipal;
import com.intervai.service.AiService;
import com.intervai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiCoachController {

    private final AiService aiService;
    private final UserService userService;

    @PostMapping("/coach")
    public ResponseEntity<AiCoachResponse> chatWithCoach(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AiCoachRequest request) {

        String context = "User: Anonymous";
        if (userPrincipal != null) {
            UserDto profile = userService.getUserProfile(userPrincipal.getId());
            context = "Name: " + profile.getName()
                    + ", Target Role: " + profile.getTargetRole()
                    + ", Experience: " + profile.getExperience()
                    + ", Average Score: " + profile.getAverageScore()
                    + ", Skills: " + String.join(", ", profile.getSkills());
        }

        AiCoachResponse response = aiService.chatWithCoach(request.getMessage(), context);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        return ResponseEntity.ok(Map.of(
                "activeProvider", aiService.getActiveProvider(),
                "hasActiveKey", aiService.hasActiveAiKey()
        ));
    }

    @PostMapping("/configure-key")
    public ResponseEntity<Map<String, String>> configureKey(@RequestBody Map<String, String> body) {
        String provider = body.get("provider");
        String key = body.get("apiKey");

        if ("gemini".equalsIgnoreCase(provider)) {
            aiService.setGeminiApiKey(key);
            return ResponseEntity.ok(Map.of("message", "Gemini API key updated successfully", "provider", aiService.getActiveProvider()));
        } else if ("openai".equalsIgnoreCase(provider)) {
            aiService.setOpenAiApiKey(key);
            return ResponseEntity.ok(Map.of("message", "OpenAI API key updated successfully", "provider", aiService.getActiveProvider()));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid provider. Use 'gemini' or 'openai'"));
    }
}
