package com.intervai.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestionDto {
    private Long id;
    private Integer questionOrder;
    private String questionText;
    private String category;
    private String targetSkill;
    private String expectedKeyPoints;
    private String modelAnswer;

    // Answer info if submitted
    private Boolean isAnswered;
    private String userAnswer;
    private Boolean isSkipped;
    private Integer timeSpentSeconds;

    // Step 2: Adaptive Follow-Up fields
    private String followUpQuestion;
    private String followUpAnswer;
    private Boolean isFollowUpAnswered;
    private String followUpFeedback;
    private Integer followUpScore;

    // Feedback info if evaluated
    private FeedbackDto feedback;
}
