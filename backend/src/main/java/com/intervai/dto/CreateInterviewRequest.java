package com.intervai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInterviewRequest {

    @NotBlank(message = "Job role is required")
    @Size(max = 100, message = "Job role must be at most 100 characters")
    private String jobRole;

    @NotBlank(message = "Experience level is required")
    @Size(max = 50, message = "Experience level must be at most 50 characters")
    private String experience; // "Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years"

    @Size(max = 25, message = "At most 25 skills can be specified")
    private List<@NotBlank(message = "Skill entry cannot be blank") @Size(max = 80, message = "Each skill must be at most 80 characters") String> skills;

    @NotBlank(message = "Interview type is required")
    @Size(max = 50, message = "Interview type must be at most 50 characters")
    private String interviewType; // Technical, Behavioral, HR, Mixed, System Design

    @NotBlank(message = "Difficulty is required")
    @Size(max = 30, message = "Difficulty must be at most 30 characters")
    private String difficulty; // Easy, Medium, Hard, Expert

    @Min(value = 1, message = "At least 1 question is required")
    @Max(value = 20, message = "Maximum 20 questions allowed")
    @Builder.Default
    private Integer numberOfQuestions = 5;

    @NotBlank(message = "Interview mode is required")
    @Size(max = 20, message = "Interview mode must be at most 20 characters")
    @Builder.Default
    private String interviewMode = "Text"; // Text, Voice

    // Step 1: Resume & Job Description (JD) Based Interviews
    @Size(max = 25000, message = "Resume text must be at most 25000 characters")
    private String resumeText;

    @Size(max = 15000, message = "Job description must be at most 15000 characters")
    private String jobDescription;

    @Size(max = 40, message = "Interview source must be at most 40 characters")
    @Builder.Default
    private String interviewSource = "PRESET"; // PRESET, RESUME, JOB_DESCRIPTION, RESUME_AND_JD

    // Step 2: Dynamic Follow-Up Questions (Adaptive Interrogation)
    @Builder.Default
    private Boolean enableAdaptiveFollowUp = true;
}
