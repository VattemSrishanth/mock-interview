package com.intervai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitFollowUpRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Follow-up answer text is required")
    private String followUpAnswerText;

    private Integer timeSpentSeconds;
}

