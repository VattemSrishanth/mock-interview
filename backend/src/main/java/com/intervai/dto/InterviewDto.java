package com.intervai.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewDto {
    private Long id;
    private Long userId;
    private String userName;
    private String jobRole;
    private String experience;
    private List<String> skills;
    private String interviewType;
    private String difficulty;
    private Integer numberOfQuestions;
    private String interviewMode;
    private String status;
    private Integer overallScore;
    private Integer technicalKnowledgeScore;
    private Integer communicationScore;
    private Integer relevanceScore;
    private Integer clarityScore;
    private Integer confidenceScore;
    private String summaryFeedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> recommendations;
    private Integer durationSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private List<InterviewQuestionDto> questions;
    private Integer currentQuestionIndex;
}
