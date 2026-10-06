package com.intervai.service;

import com.intervai.dto.AnalyticsDto;
import com.intervai.entity.Interview;
import com.intervai.entity.Performance;
import com.intervai.entity.User;
import com.intervai.exception.ResourceNotFoundException;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.PerformanceRepository;
import com.intervai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final InterviewRepository interviewRepository;
    private final PerformanceRepository performanceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AnalyticsDto getUserAnalytics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Interview> allInterviews = interviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Interview> completedInterviews = allInterviews.stream()
                .filter(i -> "COMPLETED".equals(i.getStatus()) && i.getOverallScore() != null)
                .collect(Collectors.toList());

        Long totalInterviews = (long) allInterviews.size();
        Long totalCompleted = (long) completedInterviews.size();

        Double avgScore = interviewRepository.findAverageScoreByUserId(userId);
        Integer bestScore = interviewRepository.findMaxScoreByUserId(userId);

        Double avgTech = interviewRepository.findAvgTechnicalScoreByUserId(userId);
        Double avgComm = interviewRepository.findAvgCommunicationScoreByUserId(userId);
        Double avgRel = interviewRepository.findAvgRelevanceScoreByUserId(userId);
        Double avgClar = interviewRepository.findAvgClarityScoreByUserId(userId);
        Double avgConf = interviewRepository.findAvgConfidenceScoreByUserId(userId);

        // Calculate improvement percentage: compare first completed interview with recent completed interview
        double improvement = 0.0;
        if (completedInterviews.size() >= 2) {
            Interview oldest = completedInterviews.get(completedInterviews.size() - 1);
            Interview newest = completedInterviews.get(0);
            if (oldest.getOverallScore() != null && oldest.getOverallScore() > 0 && newest.getOverallScore() != null) {
                improvement = Math.round(((double) (newest.getOverallScore() - oldest.getOverallScore()) / oldest.getOverallScore() * 100.0) * 10.0) / 10.0;
            }
        }

        // Performance over time (chronological)
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd");
        List<Map<String, Object>> timeData = new ArrayList<>();
        List<Interview> chronological = new ArrayList<>(completedInterviews);
        Collections.reverse(chronological);
        for (Interview i : chronological) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", i.getCompletedAt() != null ? i.getCompletedAt().format(dtf) : "Recent");
            map.put("score", i.getOverallScore());
            map.put("technical", i.getTechnicalKnowledgeScore() != null ? i.getTechnicalKnowledgeScore() : 0);
            map.put("communication", i.getCommunicationScore() != null ? i.getCommunicationScore() : 0);
            map.put("role", i.getJobRole());
            timeData.add(map);
        }

        // Performance by Interview Type
        Map<String, List<Integer>> typeScores = new HashMap<>();
        for (Interview i : completedInterviews) {
            typeScores.computeIfAbsent(i.getInterviewType(), k -> new ArrayList<>()).add(i.getOverallScore());
        }
        List<Map<String, Object>> typeData = new ArrayList<>();
        for (Map.Entry<String, List<Integer>> entry : typeScores.entrySet()) {
            double avg = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0.0);
            Map<String, Object> map = new HashMap<>();
            map.put("type", entry.getKey());
            map.put("score", Math.round(avg * 10.0) / 10.0);
            map.put("count", entry.getValue().size());
            typeData.add(map);
        }

        // Skill-wise performance from Performance repository
        List<Performance> performances = performanceRepository.findByUserIdOrderByScoreDesc(userId);
        List<Map<String, Object>> skillData = new ArrayList<>();
        for (Performance p : performances) {
            Map<String, Object> map = new HashMap<>();
            map.put("skill", p.getSkillName());
            map.put("score", p.getScore());
            map.put("evaluated", p.getTotalQuestionsEvaluated());
            skillData.add(map);
        }

        // Fallback default skills if newly registered user has few evaluations
        if (skillData.isEmpty()) {
            skillData.add(Map.of("skill", "Core Technical", "score", avgTech != null ? Math.round(avgTech) : 75, "evaluated", 3));
            skillData.add(Map.of("skill", "Communication", "score", avgComm != null ? Math.round(avgComm) : 78, "evaluated", 3));
            skillData.add(Map.of("skill", "Relevance", "score", avgRel != null ? Math.round(avgRel) : 80, "evaluated", 3));
            skillData.add(Map.of("skill", "Clarity", "score", avgClar != null ? Math.round(avgClar) : 76, "evaluated", 3));
        }

        // Weakest areas & recommendations
        List<String> weakest = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        if (avgComm != null && avgTech != null && avgComm < avgTech) {
            weakest.add("Concise Articulation & Communication");
            recommendations.add("Practice using the STAR framework to structure situational answers in under 90 seconds.");
        }
        if (avgTech != null && avgTech < 75) {
            weakest.add("Deep Architectural Trade-offs");
            recommendations.add("Deepen knowledge on runtime memory models, indexing internals, and concurrency trade-offs.");
        }
        if (weakest.isEmpty()) {
            weakest.add("High-concurrency System Scaling");
            weakest.add("Edge-case Handling Under Network Latency");
            recommendations.add("Practice distributed rate limiting and circuit-breaker patterns.");
            recommendations.add("Conduct 1 mock interview weekly in voice mode to simulate high-pressure phone screens.");
        }

        return AnalyticsDto.builder()
                .averageScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .bestScore(bestScore != null ? bestScore : 0)
                .currentStreak(user.getInterviewStreak() != null ? user.getInterviewStreak() : 0)
                .totalInterviews(totalInterviews)
                .completedInterviews(totalCompleted)
                .improvementPercentage(improvement)
                .averageTechnicalScore(avgTech != null ? Math.round(avgTech * 10.0) / 10.0 : 0.0)
                .averageCommunicationScore(avgComm != null ? Math.round(avgComm * 10.0) / 10.0 : 0.0)
                .averageRelevanceScore(avgRel != null ? Math.round(avgRel * 10.0) / 10.0 : 0.0)
                .averageClarityScore(avgClar != null ? Math.round(avgClar * 10.0) / 10.0 : 0.0)
                .averageConfidenceScore(avgConf != null ? Math.round(avgConf * 10.0) / 10.0 : 0.0)
                .performanceOverTime(timeData)
                .interviewTypePerformance(typeData)
                .skillWisePerformance(skillData)
                .weakestAreas(weakest)
                .recommendedPractice(recommendations)
                .build();
    }
}
