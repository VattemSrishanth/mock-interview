package com.intervai.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String targetRole;
    private String experience;
    private String careerGoal;
    private String avatarUrl;
    private Integer interviewStreak;
    private List<String> roles;
    private List<String> skills;
    private Long totalInterviews;
    private Double averageScore;
    private Integer bestScore;
    private LocalDateTime createdAt;
}
