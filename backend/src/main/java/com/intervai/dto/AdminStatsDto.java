package com.intervai.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDto {
    private Long totalUsers;
    private Long totalInterviews;
    private Long completedInterviews;
    private Double platformAverageScore;
    private List<UserDto> recentUsers;
    private List<InterviewDto> recentInterviews;
    private Map<String, Long> roleDistribution;
    private Map<String, Long> interviewTypeDistribution;
}
