package com.intervai.service;

import com.intervai.dto.CreateInterviewRequest;
import com.intervai.dto.InterviewDto;
import com.intervai.dto.InterviewQuestionDto;
import com.intervai.dto.InterviewResultDto;
import com.intervai.dto.SubmitAnswerRequest;
import com.intervai.dto.SubmitFollowUpRequest;
import com.intervai.entity.Interview;
import com.intervai.entity.InterviewQuestion;
import com.intervai.entity.Role;
import com.intervai.entity.RoleName;
import com.intervai.entity.User;
import com.intervai.exception.BadRequestException;
import com.intervai.repository.InterviewQuestionRepository;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("prod")
class AdaptiveFollowUpIntegrationTest {

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("JWT_SECRET", () -> "AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs=");
        registry.add("CORS_ALLOWED_ORIGINS", () -> "https://frontend.example.com");
        registry.add("ADMIN_EMAIL", () -> "adaptive-admin@example.com");
        registry.add("ADMIN_PASSWORD", () -> "Adaptive-Admin-Password-2026");
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:adaptive-followup-tests;DB_CLOSE_DELAY=-1");
        registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
        registry.add("app.ai.rate-limit.max-requests", () -> "100");
    }

    @Autowired private InterviewService interviewService;
    @Autowired private UserRepository userRepository;
    @Autowired private InterviewRepository interviewRepository;
    @Autowired private InterviewQuestionRepository questionRepository;

    private User candidate;

    @BeforeEach
    void setUp() {
        User template = userRepository.findByEmail("adaptive-admin@example.com").orElseThrow();
        candidate = userRepository.saveAndFlush(User.builder()
                .name("Adaptive Candidate")
                .email("candidate-" + UUID.randomUUID() + "@example.com")
                .password("test-password")
                .roles(template.getRoles())
                .build());
    }

    @Test
    void submittingAnswerGeneratesAdaptiveFollowUpAndAllowsCandidateDefense() {
        CreateInterviewRequest createReq = CreateInterviewRequest.builder()
                .jobRole("Senior Backend Developer")
                .experience("3-5 years")
                .interviewType("Technical")
                .difficulty("Hard")
                .numberOfQuestions(2)
                .interviewMode("Voice")
                .skills(List.of("Redis", "Spring Boot"))
                .enableAdaptiveFollowUp(true)
                .build();

        InterviewDto interview = interviewService.createInterview(candidate.getId(), createReq);
        assertTrue(interview.getEnableAdaptiveFollowUp());
        assertNotNull(interview.getId());
        assertEquals(2, interview.getQuestions().size());

        interviewService.startInterview(candidate.getId(), interview.getId());

        Long qId = interview.getQuestions().get(0).getId();

        // 1. Submit primary answer
        SubmitAnswerRequest answerReq = SubmitAnswerRequest.builder()
                .questionId(qId)
                .answerText("I used Redis caching to reduce latency on repeated queries and set TTLs.")
                .isSkipped(false)
                .build();

        InterviewQuestionDto evaluated = interviewService.submitAnswer(candidate.getId(), interview.getId(), answerReq);

        assertNotNull(evaluated.getFollowUpQuestion(), "Follow-up question should be dynamically generated");
        assertTrue(evaluated.getFollowUpQuestion().toLowerCase().contains("cache") || evaluated.getFollowUpQuestion().toLowerCase().contains("redis"),
                "Follow-up should target candidate's technical mention of cache/redis");

        // 2. Submit follow-up interrogation defense
        SubmitFollowUpRequest followUpReq = SubmitFollowUpRequest.builder()
                .questionId(qId)
                .followUpAnswerText("To handle cache invalidation, we used a write-through strategy with Redis Pub/Sub events for cluster invalidation, and configured volatile-lru eviction.")
                .timeSpentSeconds(35)
                .build();

        InterviewQuestionDto defended = interviewService.submitFollowUp(candidate.getId(), interview.getId(), followUpReq);

        assertTrue(defended.getIsFollowUpAnswered());
        assertEquals("To handle cache invalidation, we used a write-through strategy with Redis Pub/Sub events for cluster invalidation, and configured volatile-lru eviction.",
                defended.getFollowUpAnswer());
        assertNotNull(defended.getFollowUpFeedback());
        assertNotNull(defended.getFollowUpScore());
        assertTrue(defended.getFollowUpScore() >= 60, "Follow-up defense score should reflect technical substance");

        // 3. Complete interview and verify result dossier
        InterviewResultDto result = interviewService.completeInterview(candidate.getId(), interview.getId());
        InterviewQuestionDto resultQ = result.getQuestions().get(0);

        assertEquals(defended.getFollowUpQuestion(), resultQ.getFollowUpQuestion());
        assertEquals(defended.getFollowUpAnswer(), resultQ.getFollowUpAnswer());
        assertEquals(defended.getFollowUpFeedback(), resultQ.getFollowUpFeedback());
    }

    @Test
    void followUpRejectsWhenPrimaryAnswerNotSubmittedOrSessionNotActive() {
        CreateInterviewRequest createReq = CreateInterviewRequest.builder()
                .jobRole("Full Stack Developer")
                .experience("1-3 years")
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(1)
                .interviewMode("Text")
                .skills(List.of("React"))
                .enableAdaptiveFollowUp(true)
                .build();

        InterviewDto interview = interviewService.createInterview(candidate.getId(), createReq);
        Long qId = interview.getQuestions().get(0).getId();

        SubmitFollowUpRequest followUpReq = SubmitFollowUpRequest.builder()
                .questionId(qId)
                .followUpAnswerText("Premature defense")
                .build();

        // Should reject before starting
        assertThrows(BadRequestException.class, () ->
                interviewService.submitFollowUp(candidate.getId(), interview.getId(), followUpReq));

        interviewService.startInterview(candidate.getId(), interview.getId());

        // Should reject before submitting primary answer
        assertThrows(BadRequestException.class, () ->
                interviewService.submitFollowUp(candidate.getId(), interview.getId(), followUpReq));
    }
}
