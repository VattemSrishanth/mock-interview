package com.intervai.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeParseResponse {
    private String rawText;
    private String candidateName;
    private String suggestedRole;
    private String experienceLevel;
    private List<String> detectedSkills;
    private List<String> keyProjects;
    private String summary;
    private Integer wordCount;
}

