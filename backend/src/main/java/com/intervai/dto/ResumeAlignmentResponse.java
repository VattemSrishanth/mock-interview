package com.intervai.dto;

import lombok.*;
import java.util.List;

/**
 * Result of analyzing candidate resume against target interview rubrics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAlignmentResponse {

    private int matchPercentage; // 0 - 100
    private String alignmentTier; // "Placement Ready", "High Alignment", "Moderate Fit", "Foundational"
    private List<String> identifiedSkills;
    private List<String> missingKeySkills;
    private List<String> recommendedInterviewTracks;
    private String executiveSummary;
    private String suggestedInterviewDifficulty; // "Beginner", "Intermediate", "Advanced"
}
