package com.intervai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeExecutionRequest {

    @NotBlank(message = "Programming language is required")
    @Size(max = 50, message = "Language identifier cannot exceed 50 characters")
    private String language; // python, javascript, typescript, java, cpp, go

    @NotBlank(message = "Code snippet is required")
    @Size(max = 20000, message = "Code snippet cannot exceed 20,000 characters")
    private String code;

    @Size(max = 5000, message = "Standard input cannot exceed 5,000 characters")
    private String stdin; // optional stdin input
}

