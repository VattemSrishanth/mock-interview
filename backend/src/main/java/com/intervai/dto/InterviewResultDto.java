package com.intervai.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResultDto {
    private Long interviewId;
    private String jobRole;
    private String interviewType;
    private String interviewSource;
    private String difficulty;
    private String experience;
    private List<String> skills;
    private Integer overallScore;
    private Integer technicalKnowledgeScore;
    private Integer communicationScore;
    private Integer relevanceScore;
    private Integer clarityScore;
    private Integer confidenceScore;
    private String evaluationSource;
    private String summaryFeedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestions;
    private Integer durationSeconds;
    private LocalDateTime completedAt;
    private List<InterviewQuestionDto> questions;
    private Map<String, Integer> skillBreakdown;
}
