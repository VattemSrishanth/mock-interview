package com.intervai.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDto {
    private Double averageScore;
    private Integer bestScore;
    private Integer currentStreak;
    private Long totalInterviews;
    private Long completedInterviews;
    private Double improvementPercentage;

    private Double averageTechnicalScore;
    private Double averageCommunicationScore;
    private Double averageRelevanceScore;
    private Double averageClarityScore;
    private Double averageConfidenceScore;

    // Charts data
    private List<Map<String, Object>> performanceOverTime;
    private List<Map<String, Object>> interviewTypePerformance;
    private List<Map<String, Object>> skillWisePerformance;

    // Weakest & recommended practice
    private List<String> weakestAreas;
    private List<String> recommendedPractice;
}
