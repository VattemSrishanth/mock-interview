package com.intervai.service;

import com.intervai.dto.AnalyticsDto;
import com.intervai.dto.AuthRequest;
import com.intervai.dto.AuthResponse;
import com.intervai.dto.InterviewDto;
import com.intervai.dto.RegisterRequest;
import com.intervai.dto.SendVerificationCodeResponse;
import com.intervai.entity.Interview;
import com.intervai.entity.User;
import com.intervai.exception.BadRequestException;
import com.intervai.exception.UnauthorizedException;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
class CandidateDataIsolationIntegrationTest {

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("JWT_SECRET", () -> "AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs=");
        registry.add("CORS_ALLOWED_ORIGINS", () -> "http://localhost:5173");
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:candidate-isolation-test-" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1");
        registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
    }

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Test
    void noStaticDemoAccountsExistByDefault() {
        assertFalse(userRepository.existsByEmail("srishanth@intervai.com"), "Demo student should not be seeded");
        assertFalse(userRepository.existsByEmail("revanth@intervai.com"), "Legacy demo student should not be seeded");
        assertFalse(userRepository.existsByEmail("admin@intervai.com"), "Demo admin should not be seeded");
    }

    @Test
    void emailVerificationRequiresValidCodeAndPreventsDuplicates() {
        String email = "verify-" + UUID.randomUUID() + "@example.com";
        SendVerificationCodeResponse codeResponse = emailVerificationService.sendVerificationCode(email);
        assertTrue(codeResponse.isSuccess());
        assertNotNull(codeResponse.getDevCode());

        // Attempting registration with wrong code must fail
        RegisterRequest invalidReq = RegisterRequest.builder()
                .name("Test Candidate")
                .email(email)
                .password("Password123!")
                .verificationCode("000000")
                .skills(List.of("React"))
                .build();

        assertThrows(BadRequestException.class, () -> authService.register(invalidReq),
                "Registration with incorrect verification code must be rejected");

        // Attempting to request code for existing email must be rejected
        RegisterRequest validReq = RegisterRequest.builder()
                .name("Valid Candidate")
                .email(email)
                .password("Password123!")
                .verificationCode(codeResponse.getDevCode())
                .skills(List.of("React"))
                .build();

        AuthResponse registered = authService.register(validReq);
        assertTrue(registered.getRequiresLogin());
        assertNull(registered.getToken(), "Session token must not be granted upon registration");

        // Duplicate code request must throw BadRequestException
        assertThrows(BadRequestException.class, () -> emailVerificationService.sendVerificationCode(email),
                "Requesting verification code for registered email must be rejected");
    }

    @Test
    void newCandidateStartsAtPureZeroStateAndRequiresExplicitLogin() {
        String email = "candidate-" + UUID.randomUUID() + "@example.com";
        SendVerificationCodeResponse codeResp = emailVerificationService.sendVerificationCode(email);

        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Authentic Candidate")
                .email(email)
                .password("SecurePass123!")
                .targetRole("Backend Engineer")
                .experience("1-3 years")
                .careerGoal("Target Senior Engineer role")
                .skills(List.of("Java", "Spring Boot", "SQL"))
                .verificationCode(codeResp.getDevCode())
                .build();

        AuthResponse auth = authService.register(registerReq);
        assertTrue(auth.getRequiresLogin(), "Registration must require subsequent login for security");
        assertNull(auth.getToken(), "Registration must not grant an automatic JWT session");
        assertEquals(0, auth.getInterviewStreak(), "New candidate interview streak must start at 0");

        // Authenticate explicitly
        AuthResponse loginAuth = authService.login(new AuthRequest(email, "SecurePass123!"));
        assertNotNull(loginAuth.getToken(), "Explicit login must grant valid JWT token");

        List<InterviewDto> sessions = interviewService.getUserInterviews(auth.getId());
        assertTrue(sessions.isEmpty(), "New candidate must have exactly 0 interview sessions");

        AnalyticsDto analytics = analyticsService.getUserAnalytics(auth.getId());
        assertEquals(0L, analytics.getTotalInterviews(), "Total interviews must be 0");
        assertEquals(0L, analytics.getCompletedInterviews(), "Completed interviews must be 0");
        assertEquals(0.0, analytics.getAverageScore(), "Average score must be 0.0");
        assertEquals(0, analytics.getBestScore(), "Best score must be 0");
    }

    @Test
    void strictlyIsolatesInterviewsAndAnalyticsBetweenDistinctCandidates() {
        // Candidate 1
        String emailA = "candidate-a-" + UUID.randomUUID() + "@example.com";
        SendVerificationCodeResponse codeA = emailVerificationService.sendVerificationCode(emailA);
        AuthResponse candidateA = authService.register(RegisterRequest.builder()
                .name("Candidate Alpha")
                .email(emailA)
                .password("Password123!")
                .targetRole("Frontend Developer")
                .experience("Fresher")
                .careerGoal("Frontend Specialist")
                .skills(List.of("React", "TypeScript"))
                .verificationCode(codeA.getDevCode())
                .build());

        // Candidate 2
        String emailB = "candidate-b-" + UUID.randomUUID() + "@example.com";
        SendVerificationCodeResponse codeB = emailVerificationService.sendVerificationCode(emailB);
        AuthResponse candidateB = authService.register(RegisterRequest.builder()
                .name("Candidate Beta")
                .email(emailB)
                .password("Password123!")
                .targetRole("Backend Developer")
                .experience("3-5 years")
                .careerGoal("Staff Architect")
                .skills(List.of("Java", "Distributed Systems"))
                .verificationCode(codeB.getDevCode())
                .build());

        User userA = userRepository.findById(candidateA.getId()).orElseThrow();
        User userB = userRepository.findById(candidateB.getId()).orElseThrow();

        // Create completed interview specifically for Candidate A
        Interview interviewA = interviewRepository.save(Interview.builder()
                .user(userA)
                .jobRole("Frontend Developer")
                .experience("Fresher")
                .skills("React,TypeScript")
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(3)
                .interviewMode("Text")
                .status("COMPLETED")
                .overallScore(88)
                .technicalKnowledgeScore(90)
                .communicationScore(85)
                .relevanceScore(87)
                .clarityScore(86)
                .confidenceScore(84)
                .durationSeconds(600)
                .completedAt(LocalDateTime.now())
                .build());

        // Candidate A must see 1 interview and score of 88
        List<InterviewDto> candidateAInterviews = interviewService.getUserInterviews(userA.getId());
        assertEquals(1, candidateAInterviews.size());
        assertEquals(interviewA.getId(), candidateAInterviews.get(0).getId());

        AnalyticsDto analyticsA = analyticsService.getUserAnalytics(userA.getId());
        assertEquals(1L, analyticsA.getCompletedInterviews());
        assertEquals(88.0, analyticsA.getAverageScore());

        // Candidate B must see 0 interviews and 0 analytics (zero leakage)
        List<InterviewDto> candidateBInterviews = interviewService.getUserInterviews(userB.getId());
        assertTrue(candidateBInterviews.isEmpty(), "Candidate B must not see Candidate A's interviews");

        AnalyticsDto analyticsB = analyticsService.getUserAnalytics(userB.getId());
        assertEquals(0L, analyticsB.getCompletedInterviews(), "Candidate B completed interviews must be 0");
        assertEquals(0.0, analyticsB.getAverageScore(), "Candidate B average score must be 0.0");

        // Candidate B cannot fetch Candidate A's interview directly
        assertThrows(UnauthorizedException.class, () -> {
            interviewService.getInterview(userB.getId(), interviewA.getId());
        }, "Candidate B must be forbidden from accessing Candidate A's interview");
    }
}
