package com.intervai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInterviewRequest {

    @NotBlank(message = "Job role is required")
    private String jobRole;

    @NotBlank(message = "Experience level is required")
    private String experience; // "Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years"

    private List<String> skills;

    @NotBlank(message = "Interview type is required")
    private String interviewType; // Technical, Behavioral, HR, Mixed, System Design

    @NotBlank(message = "Difficulty is required")
    private String difficulty; // Easy, Medium, Hard, Expert

    @Min(value = 1, message = "At least 1 question is required")
    @Max(value = 20, message = "Maximum 20 questions allowed")
    @Builder.Default
    private Integer numberOfQuestions = 5;

    @NotBlank(message = "Interview mode is required")
    @Builder.Default
    private String interviewMode = "Text"; // Text, Voice
}
