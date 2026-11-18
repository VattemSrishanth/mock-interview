package com.intervai.dto;

import lombok.*;

/**
 * Request payload for analyzing resume alignment against an interview track.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAlignmentRequest {

    private String resumeText;
    private String targetRole; // e.g., "Full Stack Developer", "AI Engineer", "Backend Developer"
    private String targetCompany; // e.g., "Google", "Amazon", "General"
}
