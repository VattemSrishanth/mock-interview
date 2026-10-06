package com.intervai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiCoachRequest {
    @NotBlank(message = "Message is required")
    private String message;
    private String currentTopic;
}
