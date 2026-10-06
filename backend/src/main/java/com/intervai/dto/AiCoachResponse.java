package com.intervai.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCoachResponse {
    private String reply;
    private List<String> suggestions;
    private List<String> recommendedTopics;
    private List<String> sampleQuestions;
}
