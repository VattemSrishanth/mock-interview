package com.intervai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @NotBlank(message = "Name cannot be empty")
    private String name;
    private String targetRole;
    private String experience;
    private String careerGoal;
    private String avatarUrl;
    private List<String> skills;
}
