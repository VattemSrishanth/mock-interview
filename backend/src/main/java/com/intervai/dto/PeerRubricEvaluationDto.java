package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerRubricEvaluationDto {
    private Long reviewerUserId;
    private String reviewerName;
    private int problemSolvingScore; // 1 - 10
    private int technicalAccuracyScore; // 1 - 10
    private int communicationScore; // 1 - 10
    private int codeQualityScore; // 1 - 10
    private double overallAverageScore;
    private String strengthFeedback;
    private String growthOpportunities;
    private boolean recommendedForHire;
}
