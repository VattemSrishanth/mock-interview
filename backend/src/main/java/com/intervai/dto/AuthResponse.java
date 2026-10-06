package com.intervai.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long id;
    private String name;
    private String email;
    private List<String> roles;
    private String targetRole;
    private String experience;
    private String careerGoal;
    private String avatarUrl;
    private Integer interviewStreak;
}
