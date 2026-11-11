package com.intervai.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitFollowUpRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Follow-up answer text is required")
    @Size(max = 10000, message = "Follow-up answer must be at most 10000 characters")
    private String followUpAnswerText;

    @Min(value = 0, message = "Time spent cannot be negative")
    private Integer timeSpentSeconds;
}

