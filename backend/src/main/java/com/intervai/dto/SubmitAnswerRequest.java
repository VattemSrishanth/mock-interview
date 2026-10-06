package com.intervai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private String answerText;
    private String voiceAudioUrl;

    @Builder.Default
    private Integer timeSpentSeconds = 0;

    @Builder.Default
    private Boolean isSkipped = false;
}
