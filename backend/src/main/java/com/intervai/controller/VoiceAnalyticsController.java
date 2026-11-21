package com.intervai.controller;

import com.intervai.dto.BehavioralEmotionTelemetryDto;
import com.intervai.dto.PacingWpmAnalysisDto;
import com.intervai.dto.VoiceAcousticMetricDto;
import com.intervai.service.VoiceAcousticAnalysisService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/voice-analytics")
@RequiredArgsConstructor
public class VoiceAnalyticsController {

    private final VoiceAcousticAnalysisService voiceAcousticAnalysisService;

    @Data
    public static class VoiceAnalysisRequest {
        private String transcript;
        private double durationSeconds;
        private double averagePitchHz = 145.0;
        private double pitchStdDev = 24.0;
        private double jitterPercentage = 1.2;
        private double shimmerPercentage = 2.4;
        private double eyeGazePercentage = 88.0;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeVoiceAndCadence(@RequestBody VoiceAnalysisRequest req) {
        PacingWpmAnalysisDto pacing = voiceAcousticAnalysisService.analyzePacingAndCadence(
                req.getTranscript(), req.getDurationSeconds()
        );
        VoiceAcousticMetricDto acoustics = voiceAcousticAnalysisService.evaluateAcoustics(
                req.getAveragePitchHz(), req.getPitchStdDev(), req.getJitterPercentage(), req.getShimmerPercentage()
        );
        BehavioralEmotionTelemetryDto emotion = voiceAcousticAnalysisService.synthesizeBehavioralEmotion(
                pacing, acoustics, req.getEyeGazePercentage()
        );

        return ResponseEntity.ok(Map.of(
                "pacing", pacing,
                "acoustics", acoustics,
                "emotion", emotion,
                "overallVocalScore", Math.round((pacing.getWordsPerMinute() > 0 ? (acoustics.getConfidenceIndex() * 0.5 + emotion.getComposureIndex() * 0.5) : 70.0) * 10.0) / 10.0
        ));
    }

    @GetMapping("/sample-metrics")
    public ResponseEntity<Map<String, Object>> getSampleBenchmarkMetrics() {
        return ResponseEntity.ok(Map.of(
                "targetPacingWpmRange", "130 - 165 WPM",
                "targetPitchStability", ">= 80.0%",
                "maxAllowedJitterPct", "2.0%",
                "targetComposureIndex", ">= 85.0%",
                "guidance", "Optimal interview delivery balances measured articulation with conversational pauses."
        ));
    }
}
