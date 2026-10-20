package com.intervai.repository;

import com.intervai.Application;
import com.intervai.entity.Answer;
import com.intervai.entity.Feedback;
import com.intervai.entity.Interview;
import com.intervai.entity.InterviewQuestion;
import com.intervai.entity.Performance;
import com.intervai.entity.RoleName;
import com.intervai.entity.Skill;
import com.intervai.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = Application.class, properties = {
        "JWT_SECRET=AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs=",
        "spring.datasource.url=jdbc:h2:mem:database-persistence-tests;DB_CLOSE_DELAY=-1"
})
@ActiveProfiles("dev")
class DatabasePersistenceIntegrationTest {
    @Autowired DataSource dataSource;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired SkillRepository skillRepository;
    @Autowired InterviewRepository interviewRepository;
    @Autowired InterviewQuestionRepository questionRepository;
    @Autowired AnswerRepository answerRepository;
    @Autowired FeedbackRepository feedbackRepository;
    @Autowired PerformanceRepository performanceRepository;

    @Test
    @Transactional
    void localH2PersistsInterviewRelationshipsAndAnalytics() throws SQLException {
        try (var connection = dataSource.getConnection()) {
            assertEquals("H2", connection.getMetaData().getDatabaseProductName());
        }

        var role = roleRepository.findByName(RoleName.ROLE_STUDENT).orElseThrow();
        var skill = skillRepository.saveAndFlush(Skill.builder()
                .name("Database Test " + UUID.randomUUID())
                .category("Backend")
                .build());
        var user = userRepository.saveAndFlush(User.builder()
                .name("Database Persistence Test")
                .email("database-test-" + UUID.randomUUID() + "@example.com")
                .password("test-hash")
                .roles(Set.of(role))
                .skills(Set.of(skill))
                .build());
        var interview = interviewRepository.saveAndFlush(Interview.builder()
                .user(user)
                .jobRole("Backend Engineer")
                .experience("Mid")
                .skills(skill.getName())
                .interviewType("Technical")
                .difficulty("Medium")
                .numberOfQuestions(1)
                .interviewMode("Text")
                .status("COMPLETED")
                .overallScore(88)
                .build());
        var question = questionRepository.saveAndFlush(InterviewQuestion.builder()
                .interview(interview)
                .questionOrder(1)
                .questionText("How do you persist relational data?")
                .targetSkill(skill.getName())
                .build());
        var answer = answerRepository.saveAndFlush(Answer.builder()
                .question(question)
                .answerText("Use transactions and foreign keys.")
                .timeSpentSeconds(30)
                .build());
        var feedback = feedbackRepository.saveAndFlush(Feedback.builder()
                .answer(answer)
                .score(88)
                .technicalKnowledgeScore(90)
                .communicationScore(85)
                .relevanceScore(88)
                .clarityScore(87)
                .confidenceScore(86)
                .build());
        var performance = performanceRepository.saveAndFlush(Performance.builder()
                .user(user)
                .skillName(skill.getName())
                .score(88)
                .totalQuestionsEvaluated(1)
                .build());

        assertEquals(user.getId(), interviewRepository.findById(interview.getId()).orElseThrow().getUser().getId());
        assertEquals(interview.getId(), questionRepository.findById(question.getId()).orElseThrow().getInterview().getId());
        assertEquals(question.getId(), answerRepository.findById(answer.getId()).orElseThrow().getQuestion().getId());
        assertEquals(answer.getId(), feedbackRepository.findById(feedback.getId()).orElseThrow().getAnswer().getId());
        assertEquals(88, performanceRepository.findById(performance.getId()).orElseThrow().getScore());
        assertEquals(1, performanceRepository.findScoresByUserIdAndSkillNameIgnoreCase(user.getId(), skill.getName()).size());
    }
}
