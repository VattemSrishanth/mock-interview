package com.intervai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @Size(max = 100, message = "Target role must be at most 100 characters")
    private String targetRole;

    @Size(max = 50, message = "Experience level must be at most 50 characters")
    private String experience;

    @Size(max = 255, message = "Career goal must be at most 255 characters")
    private String careerGoal;

    @Size(max = 500, message = "Avatar URL must be at most 500 characters")
    private String avatarUrl;

    @Size(max = 30, message = "At most 30 skills can be selected")
    private List<@NotBlank(message = "Skill name cannot be blank") @Size(max = 100, message = "Skill name must be at most 100 characters") String> skills;
}
