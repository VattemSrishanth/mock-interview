package com.intervai.dto;

import lombok.*;
import java.util.List;

/**
 * Breakdown of a candidate response evaluated against the STAR behavioral interview framework.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StarEvaluationResultDto {

    private int situationScore; // 0 - 10
    private String situationFeedback;

    private int taskScore; // 0 - 10
    private String taskFeedback;

    private int actionScore; // 0 - 10
    private String actionFeedback;

    private int resultScore; // 0 - 10
    private String resultFeedback;

    private int overallStarScore; // Weighted 0 - 100
    private String starVerdict; // e.g. "Exemplary STAR Structure", "Strong Action Focus", "Needs Quantifiable Results"
    private List<String> detectedStrengths;
    private List<String> actionableImprovements;
}
