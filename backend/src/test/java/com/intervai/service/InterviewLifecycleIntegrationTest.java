package com.intervai.service;

import com.intervai.dto.InterviewDto;
import com.intervai.dto.InterviewResultDto;
import com.intervai.dto.SubmitAnswerRequest;
import com.intervai.entity.Answer;
import com.intervai.entity.Interview;
import com.intervai.entity.InterviewQuestion;
import com.intervai.entity.Performance;
import com.intervai.entity.User;
import com.intervai.exception.BadRequestException;
import com.intervai.repository.AnswerRepository;
import com.intervai.repository.FeedbackRepository;
import com.intervai.repository.InterviewQuestionRepository;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.PerformanceRepository;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("prod")
class InterviewLifecycleIntegrationTest {
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("JWT_SECRET", () -> "AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs=");
        registry.add("CORS_ALLOWED_ORIGINS", () -> "https://frontend.example.com");
        registry.add("ADMIN_EMAIL", () -> "lifecycle-admin@example.com");
        registry.add("ADMIN_PASSWORD", () -> "Lifecycle-Admin-Password-2026");
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:interview-lifecycle-tests;DB_CLOSE_DELAY=-1");
        registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
        registry.add("app.ai.rate-limit.max-requests", () -> "100");
    }

    @Autowired InterviewService interviewService;
    @Autowired UserRepository userRepository;
    @Autowired InterviewRepository interviewRepository;
    @Autowired InterviewQuestionRepository questionRepository;
    @Autowired AnswerRepository answerRepository;
    @Autowired FeedbackRepository feedbackRepository;
    @Autowired PerformanceRepository performanceRepository;

    private User user;

    @BeforeEach
    void setUp() {
        User template = userRepository.findByEmail("lifecycle-admin@example.com").orElseThrow();
        user = userRepository.saveAndFlush(User.builder()
                .name("Lifecycle Test User")
                .email("lifecycle-" + UUID.randomUUID() + "@example.com")
                .password("test-password")
                .roles(template.getRoles())
                .build());
    }

    @Test
    void acceptsAnswersOnlyBetweenStartAndCompletion() {
        Interview created = createInterview("CREATED", null, null);
        InterviewQuestion question = createQuestion(created, "Java");
        SubmitAnswerRequest answer = answer(question, "A valid answer");

        assertThrows(BadRequestException.class, () -> interviewService.submitAnswer(user.getId(), created.getId(), answer));
        assertThrows(BadRequestException.class, () -> interviewService.completeInterview(user.getId(), created.getId()));
        assertTrue(answerRepository.findByQuestionId(question.getId()).isEmpty());

        InterviewDto started = interviewService.startInterview(user.getId(), created.getId());
        assertEquals("IN_PROGRESS", started.getStatus());
        assertNotNull(started.getStartedAt());
        interviewService.submitAnswer(user.getId(), created.getId(), answer);
        interviewService.completeInterview(user.getId(), created.getId());

        assertThrows(BadRequestException.class, () -> interviewService.submitAnswer(user.getId(), created.getId(), answer));
        assertThrows(BadRequestException.class, () -> interviewService.startInterview(user.getId(), created.getId()));
    }

    @Test
    void repeatedCompletionPreservesResultsAndDoesNotChangeStreak() {
        Interview interview = createInterview("IN_PROGRESS", LocalDateTime.now().minusMinutes(4), null);
        InterviewQuestion question = createQuestion(interview, "Java");
        interviewService.submitAnswer(user.getId(), interview.getId(), answer(question, "A strong first answer"));
        InterviewResultDto completed = interviewService.completeInterview(user.getId(), interview.getId());
        int streakAfterFirstCompletion = userRepository.findById(user.getId()).orElseThrow().getInterviewStreak();

        Interview persisted = interviewRepository.findById(interview.getId()).orElseThrow();
        persisted.setOverallScore(91);
        persisted.setSummaryFeedback("Preserve this saved result");
        persisted.setDurationSeconds(777);
        LocalDateTime preservedCompletedAt = LocalDateTime.of(2026, 10, 1, 10, 15);
        persisted.setCompletedAt(preservedCompletedAt);
        interviewRepository.saveAndFlush(persisted);

        InterviewResultDto repeated = interviewService.completeInterview(user.getId(), interview.getId());
        assertEquals(91, repeated.getOverallScore());
        assertEquals("Preserve this saved result", repeated.getSummaryFeedback());
        assertEquals(777, repeated.getDurationSeconds());
        assertEquals(preservedCompletedAt, repeated.getCompletedAt());
        assertEquals(streakAfterFirstCompletion, userRepository.findById(user.getId()).orElseThrow().getInterviewStreak());
        assertNotNull(completed.getCompletedAt());
    }

    @Test
    void resubmittingAQuestionUpdatesSavedAnswerWithoutIncreasingEvaluationCount() {
        Interview interview = createInterview("IN_PROGRESS", LocalDateTime.now().minusMinutes(1), null);
        InterviewQuestion first = createQuestion(interview, "Java");
        InterviewQuestion second = createQuestion(interview, "Java");

        interviewService.submitAnswer(user.getId(), interview.getId(), answer(first, "First response"));
        Answer savedAnswer = answerRepository.findByQuestionId(first.getId()).orElseThrow();
        Long answerId = savedAnswer.getId();
        Long feedbackId = feedbackRepository.findByAnswerId(answerId).orElseThrow().getId();

        interviewService.submitAnswer(user.getId(), interview.getId(), answer(first, "Updated response"));
        interviewService.submitAnswer(user.getId(), interview.getId(), answer(second, "A second answer"));

        Answer updated = answerRepository.findByQuestionId(first.getId()).orElseThrow();
        assertEquals(answerId, updated.getId());
        assertEquals("Updated response", updated.getAnswerText());
        assertEquals(feedbackId, feedbackRepository.findByAnswerId(answerId).orElseThrow().getId());

        Performance performance = performanceRepository.findByUserIdAndSkillNameIgnoreCase(user.getId(), "Java").orElseThrow();
        List<Integer> scores = List.of(
                feedbackRepository.findByAnswerId(answerId).orElseThrow().getScore(),
                feedbackRepository.findByAnswerId(answerRepository.findByQuestionId(second.getId()).orElseThrow().getId()).orElseThrow().getScore());
        assertEquals(2, performance.getTotalQuestionsEvaluated());
        assertEquals((int) Math.round(scores.stream().mapToInt(Integer::intValue).average().orElseThrow()), performance.getScore());
    }

    @Test
    void streakCountsDistinctConsecutivePracticeDates() {
        LocalDate today = LocalDate.now();
        createCompletedInterview(today.minusDays(4));
        createCompletedInterview(today.minusDays(2));
        createCompletedInterview(today.minusDays(1));
        createCompletedInterview(today); // Another session on the current practice day.

        Interview firstToday = createInterview("IN_PROGRESS", LocalDateTime.now().minusMinutes(2), null);
        interviewService.completeInterview(user.getId(), firstToday.getId());
        assertEquals(3, userRepository.findById(user.getId()).orElseThrow().getInterviewStreak());

        Interview secondToday = createInterview("IN_PROGRESS", LocalDateTime.now().minusMinutes(1), null);
        interviewService.completeInterview(user.getId(), secondToday.getId());
        assertEquals(3, userRepository.findById(user.getId()).orElseThrow().getInterviewStreak());
    }

    private Interview createInterview(String status, LocalDateTime startedAt, LocalDateTime completedAt) {
        return interviewRepository.saveAndFlush(Interview.builder()
                .user(user)
                .jobRole("Backend Developer")
                .experience("Fresher")
                .skills("Java")
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(2)
                .interviewMode("Text")
                .status(status)
                .startedAt(startedAt)
                .completedAt(completedAt)
                .build());
    }

    private InterviewQuestion createQuestion(Interview interview, String skill) {
        return questionRepository.saveAndFlush(InterviewQuestion.builder()
                .interview(interview)
                .questionOrder((int) (questionRepository.countByInterviewId(interview.getId()) + 1))
                .questionText("Explain a concept in " + skill)
                .targetSkill(skill)
                .category("Technical")
                .modelAnswer("A complete explanation")
                .build());
    }

    private SubmitAnswerRequest answer(InterviewQuestion question, String answerText) {
        return new SubmitAnswerRequest(question.getId(), answerText, null, 30, false);
    }

    private Interview createCompletedInterview(LocalDate day) {
        return createInterview("COMPLETED", day.atTime(10, 0), day.atTime(10, 20));
    }
}
