package com.intervai.service;

import com.intervai.dto.AnalyticsDto;
import com.intervai.entity.User;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.PerformanceRepository;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private PerformanceRepository performanceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void resolveReadinessGrade_MapsScoreAndCompletionThresholds() {
        assertEquals("CALIBRATING", AnalyticsService.resolveReadinessGrade(92.0, 0));
        assertEquals("PLACEMENT_READY", AnalyticsService.resolveReadinessGrade(86.5, 3));
        assertEquals("COMPETITIVE", AnalyticsService.resolveReadinessGrade(74.0, 2));
        assertEquals("FOUNDATIONAL", AnalyticsService.resolveReadinessGrade(61.5, 1));
    }

    @Test
    void getUserAnalytics_DetectsClarityAndConfidenceWeakAreas() {
        User candidate = new User();
        candidate.setId(10L);
        candidate.setInterviewStreak(4);

        when(userRepository.findById(10L)).thenReturn(Optional.of(candidate));
        when(interviewRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());
        when(interviewRepository.findAverageScoreByUserId(10L)).thenReturn(72.0);
        when(interviewRepository.findMaxScoreByUserId(10L)).thenReturn(80);
        when(interviewRepository.findAvgTechnicalScoreByUserId(10L)).thenReturn(82.0);
        when(interviewRepository.findAvgCommunicationScoreByUserId(10L)).thenReturn(78.0);
        when(interviewRepository.findAvgRelevanceScoreByUserId(10L)).thenReturn(80.0);
        when(interviewRepository.findAvgClarityScoreByUserId(10L)).thenReturn(68.0);
        when(interviewRepository.findAvgConfidenceScoreByUserId(10L)).thenReturn(65.0);
        when(performanceRepository.findByUserIdOrderByScoreDesc(10L)).thenReturn(Collections.emptyList());

        AnalyticsDto analytics = analyticsService.getUserAnalytics(10L);

        assertNotNull(analytics);
        assertEquals("CALIBRATING", analytics.getReadinessGrade());
        assertEquals(4, analytics.getCurrentStreak());
        assertTrue(analytics.getWeakestAreas().contains("Structured Answer Clarity"));
        assertTrue(analytics.getWeakestAreas().contains("Vocal Pacing & Delivery Poise"));
        assertTrue(analytics.getWeakestAreas().contains("Concise Articulation & Communication"));
    }
}
