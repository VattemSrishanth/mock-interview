package com.intervai.service;

import com.intervai.dto.AdminStatsDto;
import com.intervai.dto.InterviewDto;
import com.intervai.dto.UserDto;
import com.intervai.entity.Interview;
import com.intervai.entity.User;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final UserService userService;
    private final InterviewService interviewService;

    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        long totalUsers = userRepository.count();
        long totalInterviews = interviewRepository.count();
        long completedInterviews = interviewRepository.findAll().stream()
                .filter(i -> "COMPLETED".equals(i.getStatus()))
                .count();

        double avgScore = interviewRepository.findAll().stream()
                .filter(i -> "COMPLETED".equals(i.getStatus()) && i.getOverallScore() != null)
                .mapToInt(Interview::getOverallScore)
                .average()
                .orElse(0.0);

        List<UserDto> recentUsers = userRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(userService::mapToDto)
                .collect(Collectors.toList());

        List<InterviewDto> recentInterviews = interviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(8)
                .map(interviewService::mapToDto)
                .collect(Collectors.toList());

        Map<String, Long> roleDist = new HashMap<>();
        for (Interview i : interviewRepository.findAll()) {
            roleDist.put(i.getJobRole(), roleDist.getOrDefault(i.getJobRole(), 0L) + 1);
        }

        Map<String, Long> typeDist = new HashMap<>();
        for (Interview i : interviewRepository.findAll()) {
            typeDist.put(i.getInterviewType(), typeDist.getOrDefault(i.getInterviewType(), 0L) + 1);
        }

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalInterviews(totalInterviews)
                .completedInterviews(completedInterviews)
                .platformAverageScore(Math.round(avgScore * 10.0) / 10.0)
                .recentUsers(recentUsers)
                .recentInterviews(recentInterviews)
                .roleDistribution(roleDist)
                .interviewTypeDistribution(typeDist)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getAllInterviews() {
        return interviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(interviewService::mapToDto)
                .collect(Collectors.toList());
    }
}
