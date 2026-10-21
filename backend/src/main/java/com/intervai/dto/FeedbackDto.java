package com.intervai.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDto {
    private Long id;
    private Integer score;
    private Integer technicalKnowledge;
    private Integer communication;
    private Integer relevance;
    private Integer clarity;
    private Integer confidence;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestions;
    private String modelAnswer;
    /** AI_PROVIDER, HEURISTIC, or SKIPPED. Null is reserved for legacy records. */
    private String evaluationSource;

    // Step 2: Dynamic Follow-Up Questions (Adaptive Interrogation)
    private String followUpQuestion;
    private String followUpFeedback;
    private Integer followUpScore;
}
