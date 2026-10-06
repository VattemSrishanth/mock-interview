package com.intervai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.dto.*;
import com.intervai.entity.*;
import com.intervai.exception.BadRequestException;
import com.intervai.exception.ResourceNotFoundException;
import com.intervai.exception.UnauthorizedException;
import com.intervai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final PerformanceRepository performanceRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    @Transactional
    public InterviewDto createInterview(Long userId, CreateInterviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String skillsString = request.getSkills() != null ? String.join(",", request.getSkills()) : "";

        Interview interview = Interview.builder()
                .user(user)
                .jobRole(request.getJobRole())
                .experience(request.getExperience())
                .skills(skillsString)
                .interviewType(request.getInterviewType())
                .difficulty(request.getDifficulty())
                .numberOfQuestions(request.getNumberOfQuestions())
                .interviewMode(request.getInterviewMode())
                .status("CREATED")
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        // Generate questions using AI
        List<InterviewQuestion> generatedQuestions = aiService.generateQuestions(request);
        for (InterviewQuestion q : generatedQuestions) {
            q.setInterview(savedInterview);
            questionRepository.save(q);
        }

        savedInterview.setQuestions(generatedQuestions);
        return mapToDto(savedInterview);
    }

    @Transactional
    public InterviewDto startInterview(Long userId, Long interviewId) {
        Interview interview = getAuthorizedInterview(userId, interviewId);
        if ("CREATED".equals(interview.getStatus())) {
            interview.setStatus("IN_PROGRESS");
            interview.setStartedAt(LocalDateTime.now());
            interview = interviewRepository.save(interview);
        }
        return mapToDto(interview);
    }

    @Transactional(readOnly = true)
    public InterviewDto getInterview(Long userId, Long interviewId) {
        Interview interview = getAuthorizedInterview(userId, interviewId);
        return mapToDto(interview);
    }

    @Transactional
    public InterviewQuestionDto submitAnswer(Long userId, Long interviewId, SubmitAnswerRequest request) {
        Interview interview = getAuthorizedInterview(userId, interviewId);

        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        if (!question.getInterview().getId().equals(interview.getId())) {
            throw new BadRequestException("Question does not belong to this interview session");
        }

        // Check if answer already exists
        Answer answer = answerRepository.findByQuestionId(question.getId())
                .orElseGet(() -> Answer.builder().question(question).build());

        answer.setAnswerText(request.getAnswerText());
        answer.setIsSkipped(Boolean.TRUE.equals(request.getIsSkipped()));
        answer.setTimeSpentSeconds(request.getTimeSpentSeconds() != null ? request.getTimeSpentSeconds() : 0);
        answer.setVoiceAudioUrl(request.getVoiceAudioUrl());

        Answer savedAnswer = answerRepository.save(answer);

        // AI evaluation of answer
        FeedbackDto evaluation = aiService.evaluateAnswer(
                question.getQuestionText(),
                question.getTargetSkill(),
                question.getCategory(),
                request.getAnswerText(),
                interview.getJobRole(),
                interview.getDifficulty(),
                Boolean.TRUE.equals(request.getIsSkipped())
        );

        Feedback feedback = feedbackRepository.findByAnswerId(savedAnswer.getId())
                .orElseGet(() -> Feedback.builder().answer(savedAnswer).build());

        feedback.setScore(evaluation.getScore());
        feedback.setTechnicalKnowledgeScore(evaluation.getTechnicalKnowledge());
        feedback.setCommunicationScore(evaluation.getCommunication());
        feedback.setRelevanceScore(evaluation.getRelevance());
        feedback.setClarityScore(evaluation.getClarity());
        feedback.setConfidenceScore(evaluation.getConfidence());

        try {
            feedback.setStrengthsJson(objectMapper.writeValueAsString(evaluation.getStrengths()));
            feedback.setWeaknessesJson(objectMapper.writeValueAsString(evaluation.getWeaknesses()));
            feedback.setSuggestionsJson(objectMapper.writeValueAsString(evaluation.getSuggestions()));
        } catch (Exception e) {
            log.error("Error serializing feedback JSON", e);
        }

        feedback.setModelAnswer(evaluation.getModelAnswer() != null ? evaluation.getModelAnswer() : question.getModelAnswer());
        feedbackRepository.save(feedback);

        // Update skill performance
        updateSkillPerformance(interview.getUser(), question.getTargetSkill(), evaluation.getScore());

        return mapQuestionToDto(question, savedAnswer, feedback);
    }

    @Transactional
    public InterviewResultDto completeInterview(Long userId, Long interviewId) {
        Interview interview = getAuthorizedInterview(userId, interviewId);

        List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByQuestionOrderAsc(interviewId);
        List<Answer> answers = questions.stream()
                .map(q -> answerRepository.findByQuestionId(q.getId()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Feedback> feedbacks = answers.stream()
                .map(a -> feedbackRepository.findByAnswerId(a.getId()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        int overall = 0;
        int tech = 0;
        int comm = 0;
        int rel = 0;
        int clar = 0;
        int conf = 0;

        List<String> aggregatedStrengths = new ArrayList<>();
        List<String> aggregatedWeaknesses = new ArrayList<>();
        List<String> aggregatedSuggestions = new ArrayList<>();

        if (!feedbacks.isEmpty()) {
            for (Feedback fb : feedbacks) {
                overall += fb.getScore() != null ? fb.getScore() : 0;
                tech += fb.getTechnicalKnowledgeScore() != null ? fb.getTechnicalKnowledgeScore() : 0;
                comm += fb.getCommunicationScore() != null ? fb.getCommunicationScore() : 0;
                rel += fb.getRelevanceScore() != null ? fb.getRelevanceScore() : 0;
                clar += fb.getClarityScore() != null ? fb.getClarityScore() : 0;
                conf += fb.getConfidenceScore() != null ? fb.getConfidenceScore() : 0;

                try {
                    if (fb.getStrengthsJson() != null) {
                        List<String> list = objectMapper.readValue(fb.getStrengthsJson(), new TypeReference<List<String>>() {});
                        aggregatedStrengths.addAll(list);
                    }
                    if (fb.getWeaknessesJson() != null) {
                        List<String> list = objectMapper.readValue(fb.getWeaknessesJson(), new TypeReference<List<String>>() {});
                        aggregatedWeaknesses.addAll(list);
                    }
                    if (fb.getSuggestionsJson() != null) {
                        List<String> list = objectMapper.readValue(fb.getSuggestionsJson(), new TypeReference<List<String>>() {});
                        aggregatedSuggestions.addAll(list);
                    }
                } catch (Exception ignored) {}
            }

            int n = feedbacks.size();
            overall = Math.round((float) overall / n);
            tech = Math.round((float) tech / n);
            comm = Math.round((float) comm / n);
            rel = Math.round((float) rel / n);
            clar = Math.round((float) clar / n);
            conf = Math.round((float) conf / n);
        }

        LocalDateTime now = LocalDateTime.now();
        interview.setCompletedAt(now);
        interview.setStatus("COMPLETED");
        interview.setOverallScore(overall);
        interview.setTechnicalKnowledgeScore(tech);
        interview.setCommunicationScore(comm);
        interview.setRelevanceScore(rel);
        interview.setClarityScore(clar);
        interview.setConfidenceScore(conf);

        int duration = 0;
        if (interview.getStartedAt() != null) {
            duration = (int) Duration.between(interview.getStartedAt(), now).getSeconds();
        }
        interview.setDurationSeconds(duration > 0 ? duration : 300);

        try {
            interview.setStrengthsJson(objectMapper.writeValueAsString(deduplicateTop(aggregatedStrengths, 4)));
            interview.setWeaknessesJson(objectMapper.writeValueAsString(deduplicateTop(aggregatedWeaknesses, 4)));
            interview.setRecommendationsJson(objectMapper.writeValueAsString(deduplicateTop(aggregatedSuggestions, 4)));
        } catch (Exception ignored) {}

        interview.setSummaryFeedback(buildSummaryText(overall, interview.getJobRole(), tech, comm));
        Interview saved = interviewRepository.save(interview);

        // Update streak
        User user = interview.getUser();
        user.setInterviewStreak((user.getInterviewStreak() != null ? user.getInterviewStreak() : 0) + 1);
        userRepository.save(user);

        return getInterviewResult(userId, saved.getId());
    }

    @Transactional(readOnly = true)
    public InterviewResultDto getInterviewResult(Long userId, Long interviewId) {
        Interview interview = getAuthorizedInterview(userId, interviewId);

        List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByQuestionOrderAsc(interviewId);
        List<InterviewQuestionDto> questionDtos = questions.stream()
                .map(q -> {
                    Answer a = answerRepository.findByQuestionId(q.getId()).orElse(null);
                    Feedback fb = a != null ? feedbackRepository.findByAnswerId(a.getId()).orElse(null) : null;
                    return mapQuestionToDto(q, a, fb);
                })
                .collect(Collectors.toList());

        List<String> strengths = parseJsonList(interview.getStrengthsJson());
        List<String> weaknesses = parseJsonList(interview.getWeaknessesJson());
        List<String> recommendations = parseJsonList(interview.getRecommendationsJson());

        Map<String, Integer> skillBreakdown = new HashMap<>();
        for (InterviewQuestion q : questions) {
            String skill = q.getTargetSkill() != null ? q.getTargetSkill() : "Core Knowledge";
            Answer a = answerRepository.findByQuestionId(q.getId()).orElse(null);
            if (a != null) {
                Feedback fb = feedbackRepository.findByAnswerId(a.getId()).orElse(null);
                if (fb != null && fb.getScore() != null) {
                    skillBreakdown.put(skill, fb.getScore());
                }
            }
        }

        List<String> skills = interview.getSkills() != null
                ? Arrays.stream(interview.getSkills().split(",")).filter(s -> !s.isBlank()).collect(Collectors.toList())
                : List.of();

        return InterviewResultDto.builder()
                .interviewId(interview.getId())
                .jobRole(interview.getJobRole())
                .interviewType(interview.getInterviewType())
                .difficulty(interview.getDifficulty())
                .experience(interview.getExperience())
                .skills(skills)
                .overallScore(interview.getOverallScore() != null ? interview.getOverallScore() : 0)
                .technicalKnowledgeScore(interview.getTechnicalKnowledgeScore() != null ? interview.getTechnicalKnowledgeScore() : 0)
                .communicationScore(interview.getCommunicationScore() != null ? interview.getCommunicationScore() : 0)
                .relevanceScore(interview.getRelevanceScore() != null ? interview.getRelevanceScore() : 0)
                .clarityScore(interview.getClarityScore() != null ? interview.getClarityScore() : 0)
                .confidenceScore(interview.getConfidenceScore() != null ? interview.getConfidenceScore() : 0)
                .summaryFeedback(interview.getSummaryFeedback())
                .strengths(strengths)
                .weaknesses(weaknesses)
                .suggestions(recommendations)
                .durationSeconds(interview.getDurationSeconds() != null ? interview.getDurationSeconds() : 0)
                .completedAt(interview.getCompletedAt())
                .questions(questionDtos)
                .skillBreakdown(skillBreakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getUserInterviews(Long userId) {
        return interviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getRecentInterviews(Long userId) {
        return interviewRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteInterview(Long userId, Long interviewId) {
        Interview interview = getAuthorizedInterview(userId, interviewId);
        interviewRepository.delete(interview);
    }

    private Interview getAuthorizedInterview(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        if (!interview.getUser().getId().equals(userId)) {
            // Also allow admin check if needed
            boolean isAdmin = interview.getUser().getRoles().stream()
                    .anyMatch(r -> r.getName().equals(RoleName.ROLE_ADMIN));
            if (!isAdmin) {
                throw new UnauthorizedException("You are not authorized to access this interview");
            }
        }
        return interview;
    }

    private void updateSkillPerformance(User user, String skillName, Integer score) {
        if (skillName == null || score == null) return;
        Performance perf = performanceRepository.findByUserIdAndSkillNameIgnoreCase(user.getId(), skillName.trim())
                .orElseGet(() -> Performance.builder()
                        .user(user)
                        .skillName(skillName.trim())
                        .score(score)
                        .totalQuestionsEvaluated(0)
                        .build());

        int currentTotal = perf.getTotalQuestionsEvaluated() != null ? perf.getTotalQuestionsEvaluated() : 0;
        int currentScore = perf.getScore() != null ? perf.getScore() : score;
        int updatedScore = (int) Math.round((currentScore * currentTotal + score) / (double) (currentTotal + 1));

        perf.setScore(updatedScore);
        perf.setTotalQuestionsEvaluated(currentTotal + 1);
        performanceRepository.save(perf);
    }

    private List<String> deduplicateTop(List<String> list, int max) {
        return list.stream().distinct().limit(max).collect(Collectors.toList());
    }

    private String buildSummaryText(int overall, String role, int tech, int comm) {
        if (overall >= 85) {
            return "Exceptional performance! You demonstrated outstanding technical mastery and concise, professional communication tailored for a senior " + role + ".";
        } else if (overall >= 70) {
            return "Strong interview performance! You have a solid grasp of core fundamentals with great problem-solving aptitude. Refining deeper architectural nuances will elevate you to top percentile.";
        } else {
            return "Good practice session! Focus on expanding your technical depth and utilizing the STAR technique to structure answers with real-world examples.";
        }
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    public InterviewDto mapToDto(Interview interview) {
        List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByQuestionOrderAsc(interview.getId());
        List<InterviewQuestionDto> questionDtos = questions.stream()
                .map(q -> {
                    Answer a = answerRepository.findByQuestionId(q.getId()).orElse(null);
                    Feedback fb = a != null ? feedbackRepository.findByAnswerId(a.getId()).orElse(null) : null;
                    return mapQuestionToDto(q, a, fb);
                })
                .collect(Collectors.toList());

        // Find current question index (first unanswered question)
        int currentIndex = 0;
        for (int i = 0; i < questionDtos.size(); i++) {
            if (!Boolean.TRUE.equals(questionDtos.get(i).getIsAnswered())) {
                currentIndex = i;
                break;
            }
            if (i == questionDtos.size() - 1) {
                currentIndex = questionDtos.size() - 1;
            }
        }

        List<String> skills = interview.getSkills() != null
                ? Arrays.stream(interview.getSkills().split(",")).filter(s -> !s.isBlank()).collect(Collectors.toList())
                : List.of();

        return InterviewDto.builder()
                .id(interview.getId())
                .userId(interview.getUser().getId())
                .userName(interview.getUser().getName())
                .jobRole(interview.getJobRole())
                .experience(interview.getExperience())
                .skills(skills)
                .interviewType(interview.getInterviewType())
                .difficulty(interview.getDifficulty())
                .numberOfQuestions(interview.getNumberOfQuestions())
                .interviewMode(interview.getInterviewMode())
                .status(interview.getStatus())
                .overallScore(interview.getOverallScore())
                .technicalKnowledgeScore(interview.getTechnicalKnowledgeScore())
                .communicationScore(interview.getCommunicationScore())
                .relevanceScore(interview.getRelevanceScore())
                .clarityScore(interview.getClarityScore())
                .confidenceScore(interview.getConfidenceScore())
                .summaryFeedback(interview.getSummaryFeedback())
                .strengths(parseJsonList(interview.getStrengthsJson()))
                .weaknesses(parseJsonList(interview.getWeaknessesJson()))
                .recommendations(parseJsonList(interview.getRecommendationsJson()))
                .durationSeconds(interview.getDurationSeconds())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .createdAt(interview.getCreatedAt())
                .questions(questionDtos)
                .currentQuestionIndex(currentIndex)
                .build();
    }

    private InterviewQuestionDto mapQuestionToDto(InterviewQuestion q, Answer a, Feedback fb) {
        FeedbackDto fbDto = null;
        if (fb != null) {
            fbDto = FeedbackDto.builder()
                    .id(fb.getId())
                    .score(fb.getScore())
                    .technicalKnowledge(fb.getTechnicalKnowledgeScore())
                    .communication(fb.getCommunicationScore())
                    .relevance(fb.getRelevanceScore())
                    .clarity(fb.getClarityScore())
                    .confidence(fb.getConfidenceScore())
                    .strengths(parseJsonList(fb.getStrengthsJson()))
                    .weaknesses(parseJsonList(fb.getWeaknessesJson()))
                    .suggestions(parseJsonList(fb.getSuggestionsJson()))
                    .modelAnswer(fb.getModelAnswer())
                    .build();
        }

        return InterviewQuestionDto.builder()
                .id(q.getId())
                .questionOrder(q.getQuestionOrder())
                .questionText(q.getQuestionText())
                .category(q.getCategory())
                .targetSkill(q.getTargetSkill())
                .expectedKeyPoints(q.getExpectedKeyPoints())
                .modelAnswer(q.getModelAnswer())
                .isAnswered(a != null)
                .userAnswer(a != null ? a.getAnswerText() : null)
                .isSkipped(a != null && Boolean.TRUE.equals(a.getIsSkipped()))
                .timeSpentSeconds(a != null ? a.getTimeSpentSeconds() : 0)
                .feedback(fbDto)
                .build();
    }
}
