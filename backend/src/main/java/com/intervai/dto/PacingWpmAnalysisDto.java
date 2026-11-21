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
public class PacingWpmAnalysisDto {
    private int totalSpokenWords;
    private double durationSeconds;
    private double wordsPerMinute;
    private String pacingTier; // TOO_SLOW, METHODICAL, OPTIMAL, ACCELERATED, RUSHED
    private int pauseCount;
    private double averagePauseDurationSeconds;
    private int fillerWordCount;
    private List<String> detectedFillers;
    private String pacingRecommendation;
}
