package com.intervai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeExecutionRequest {

    @NotBlank(message = "Programming language is required")
    private String language; // python, javascript, typescript, java, cpp, go

    @NotBlank(message = "Code snippet is required")
    private String code;

    private String stdin; // optional stdin input
}

