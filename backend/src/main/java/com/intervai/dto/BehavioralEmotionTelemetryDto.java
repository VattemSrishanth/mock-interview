package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralEmotionTelemetryDto {
    private String primaryEmotion; // CONFIDENT, CALM, HESITANT, ANXIOUS, EXCITED
    private double emotionConfidence; // 0 - 100
    private double eyeGazeSteadinessPercentage;
    private List<String> microExpressionsDetected;
    private String behavioralSummary;
    private double composureIndex; // 0 - 100
    private List<String> composureFeedbackNotes;
}
