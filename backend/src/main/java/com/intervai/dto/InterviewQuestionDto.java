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

    // Feedback info if evaluated
    private FeedbackDto feedback;
}
