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
public class VoiceAcousticMetricDto {
    private double averagePitchHz;
    private double pitchStabilityScore; // 0 - 100
    private double jitterPercentage;
    private double shimmerPercentage;
    private String voiceSteadiness; // MONOTONIC, BALANCED, ENGAGING, VOLATILE
    private double confidenceIndex; // 0 - 100
    private List<String> acousticObservations;
}
