package com.intervai.service;

import com.intervai.dto.UpdateProfileRequest;
import com.intervai.dto.UserDto;
import com.intervai.entity.Skill;
import com.intervai.entity.User;
import com.intervai.exception.ResourceNotFoundException;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.SkillRepository;
import com.intervai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final InterviewRepository interviewRepository;

    @Transactional(readOnly = true)
    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return mapToDto(user);
    }

    @Transactional
    public UserDto updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setName(request.getName());
        if (request.getTargetRole() != null) user.setTargetRole(request.getTargetRole());
        if (request.getExperience() != null) user.setExperience(request.getExperience());
        if (request.getCareerGoal() != null) user.setCareerGoal(request.getCareerGoal());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        if (request.getSkills() != null) {
            Set<Skill> updatedSkills = new HashSet<>();
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName.trim()).category("General").build()));
                updatedSkills.add(skill);
            }
            user.setSkills(updatedSkills);
        }

        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getLeaderboard() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .map(u -> {
                    // Privacy protection: Mask email in public leaderboards
                    if (u.getEmail() != null && u.getEmail().contains("@")) {
                        String[] parts = u.getEmail().split("@");
                        String maskedPrefix = parts[0].length() > 2
                                ? parts[0].substring(0, 2) + "***"
                                : "***";
                        u.setEmail(maskedPrefix + "@" + parts[1]);
                    }
                    return u;
                })
                .sorted((a, b) -> {
                    Double scoreA = a.getAverageScore() != null ? a.getAverageScore() : 0.0;
                    Double scoreB = b.getAverageScore() != null ? b.getAverageScore() : 0.0;
                    return scoreB.compareTo(scoreA);
                })
                .limit(20)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllSkills() {
        return skillRepository.findAllByOrderByCategoryAscNameAsc().stream()
                .map(Skill::getName)
                .collect(Collectors.toList());
    }

    public UserDto mapToDto(User user) {
        Long totalInterviews = interviewRepository.countByUserId(user.getId());
        Double avgScore = interviewRepository.findAverageScoreByUserId(user.getId());
        Integer bestScore = interviewRepository.findMaxScoreByUserId(user.getId());

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        List<String> skills = user.getSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .targetRole(user.getTargetRole())
                .experience(user.getExperience())
                .careerGoal(user.getCareerGoal())
                .avatarUrl(user.getAvatarUrl())
                .interviewStreak(user.getInterviewStreak() != null ? user.getInterviewStreak() : 0)
                .roles(roles)
                .skills(skills)
                .totalInterviews(totalInterviews)
                .averageScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .bestScore(bestScore != null ? bestScore : 0)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
