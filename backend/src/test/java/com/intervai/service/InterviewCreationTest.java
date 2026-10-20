package com.intervai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.CreateInterviewRequest;
import com.intervai.entity.Interview;
import com.intervai.entity.InterviewQuestion;
import com.intervai.entity.User;
import com.intervai.repository.AnswerRepository;
import com.intervai.repository.FeedbackRepository;
import com.intervai.repository.InterviewQuestionRepository;
import com.intervai.repository.InterviewRepository;
import com.intervai.repository.PerformanceRepository;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewCreationTest {
    @Mock InterviewRepository interviewRepository;
    @Mock InterviewQuestionRepository questionRepository;
    @Mock AnswerRepository answerRepository;
    @Mock FeedbackRepository feedbackRepository;
    @Mock UserRepository userRepository;
    @Mock PerformanceRepository performanceRepository;
    @Mock AiService aiService;
    @Mock AiRateLimiter aiRateLimiter;

    @Test
    void createsInterviewAndAssociatesGeneratedQuestionsWithoutCallingExternalProviders() {
        User user = User.builder().id(7L).name("Candidate").build();
        CreateInterviewRequest request = CreateInterviewRequest.builder()
                .jobRole("Backend Engineer")
                .experience("Mid")
                .skills(List.of("Java", "Spring"))
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(1)
                .interviewMode("Text")
                .build();
        InterviewQuestion generatedQuestion = InterviewQuestion.builder()
                .id(18L)
                .questionOrder(1)
                .questionText("How do transactions work?")
                .targetSkill("Java")
                .build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(aiService.generateQuestions(request)).thenReturn(List.of(generatedQuestion));
        when(interviewRepository.save(any(Interview.class))).thenAnswer(invocation -> {
            Interview interview = invocation.getArgument(0);
            interview.setId(12L);
            return interview;
        });
        when(questionRepository.save(generatedQuestion)).thenReturn(generatedQuestion);
        when(questionRepository.findByInterviewIdOrderByQuestionOrderAsc(12L)).thenReturn(List.of(generatedQuestion));
        when(answerRepository.findByQuestionId(18L)).thenReturn(Optional.empty());

        var created = new InterviewService(interviewRepository, questionRepository, answerRepository,
                feedbackRepository, userRepository, performanceRepository, aiService, aiRateLimiter,
                new ObjectMapper()).createInterview(7L, request);

        assertEquals(12L, created.getId());
        assertEquals("CREATED", created.getStatus());
        assertEquals(List.of("Java", "Spring"), created.getSkills());
        assertEquals(1, created.getQuestions().size());
        assertEquals("How do transactions work?", created.getQuestions().get(0).getQuestionText());
        assertEquals(12L, generatedQuestion.getInterview().getId());
        verify(aiService).generateQuestions(request);
        verify(questionRepository).save(generatedQuestion);
    }
}
