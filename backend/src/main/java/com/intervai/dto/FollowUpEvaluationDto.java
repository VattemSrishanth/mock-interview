package com.intervai.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUpEvaluationDto {
    private Integer score;
    private String feedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private String evaluationSource;
}

