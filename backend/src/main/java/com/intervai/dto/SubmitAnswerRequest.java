package com.intervai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.AssertTrue;
import lombok.*;
import org.springframework.util.StringUtils;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @Size(max = 10000, message = "Answer must be at most 10000 characters")
    private String answerText;

    @Size(max = 2048, message = "Voice audio URL must be at most 2048 characters")
    private String voiceAudioUrl;

    @Builder.Default
    private Integer timeSpentSeconds = 0;

    @Builder.Default
    private Boolean isSkipped = false;

    @AssertTrue(message = "Answer text is required unless the question is skipped")
    public boolean isAnswerTextProvided() {
        return Boolean.TRUE.equals(isSkipped) || StringUtils.hasText(answerText);
    }
}
