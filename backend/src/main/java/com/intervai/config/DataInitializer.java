package com.intervai.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.intervai.entity.*;
import com.intervai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final FeedbackRepository feedbackRepository;
    private final PerformanceRepository performanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;

    @Value("${app.admin.email:}")
    private String bootstrapAdminEmail;

    @Value("${app.admin.password:}")
    private String bootstrapAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        // 1. Roles
        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_STUDENT).build()));

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build()));

        // 2. Skills
        List<String> defaultSkills = List.of(
                "React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Next.js",
                "Java", "Spring Boot", "Spring Data JPA", "Microservices", "Hibernate",
                "Python", "Django", "FastAPI",
                "SQL", "PostgreSQL", "MongoDB", "Redis",
                "AWS", "Docker", "Kubernetes", "Git", "REST APIs",
                "System Design", "Communication", "Problem Solving"
        );

        Map<String, Skill> skillMap = new HashMap<>();
        for (String skillName : defaultSkills) {
            Skill s = skillRepository.findByNameIgnoreCase(skillName)
                    .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName).category("General").build()));
            skillMap.put(skillName, s);
        }

        if (!seedDemoData) {
            seedConfiguredAdmin(studentRole, adminRole);
            return;
        }

        // 3. Demo Student User: V Srishanth
        if (!userRepository.existsByEmail("srishanth@intervai.com") && !userRepository.existsByEmail("revanth@intervai.com")) {
            Set<Skill> srishanthSkills = new HashSet<>();
            srishanthSkills.add(skillMap.get("React"));
            srishanthSkills.add(skillMap.get("JavaScript"));
            srishanthSkills.add(skillMap.get("HTML"));
            srishanthSkills.add(skillMap.get("CSS"));
            srishanthSkills.add(skillMap.get("REST APIs"));

            User srishanth = User.builder()
                    .name("V Srishanth")
                    .email("srishanth@intervai.com")
                    .password(passwordEncoder.encode("password123"))
                    .targetRole("Frontend Developer")
                    .experience("Fresher")
                    .careerGoal("Secure a Frontend Engineer role at a top-tier tech product company")
                    .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Srishanth")
                    .interviewStreak(5)
                    .roles(Set.of(studentRole))
                    .skills(srishanthSkills)
                    .build();

            srishanth = userRepository.save(srishanth);
            log.info("Default student user seeded: srishanth@intervai.com / password123");

            // Seed sample past completed interviews for V Srishanth
            seedSampleInterview(srishanth, "Frontend Developer", "Technical", "Medium", 84, 88, 78, 86, 82, 76,
                    LocalDateTime.now().minusHours(2), 5,
                    List.of("Strong grasp of React rendering cycles and hooks", "Structured modular approach to state management"),
                    List.of("Could provide deeper real-world examples for Core Web Vitals"),
                    List.of("Review INP and cumulative layout shift optimizations in large SPAs"));

            seedSampleInterview(srishanth, "Backend Developer", "HR", "Medium", 76, 72, 82, 78, 75, 74,
                    LocalDateTime.now().minusDays(1), 5,
                    List.of("Articulate and professional presence", "Clear enthusiasm for continuous learning"),
                    List.of("Use the STAR framework more strictly when narrating past conflict resolution"),
                    List.of("Quantify business outcomes and team velocity improvements"));

            seedSampleInterview(srishanth, "Full Stack Developer", "System Design", "Hard", 88, 90, 84, 91, 86, 82,
                    LocalDateTime.now().minusDays(3), 5,
                    List.of("Excellent breakdown of micro-frontends and caching layers", "Effective database sharding rationale"),
                    List.of("Expand on distributed locking with Redis vs Zookeeper"),
                    List.of("Practice drawing rapid ASCII/mental architecture topologies"));

            // Seed skill performances
            seedPerformance(srishanth, "React", 88, 12);
            seedPerformance(srishanth, "JavaScript", 85, 10);
            seedPerformance(srishanth, "REST APIs", 82, 8);
            seedPerformance(srishanth, "Communication", 79, 15);
            seedPerformance(srishanth, "System Design", 84, 6);
        } else if (userRepository.existsByEmail("revanth@intervai.com")) {
            userRepository.findByEmail("revanth@intervai.com").ifPresent(u -> {
                u.setName("V Srishanth");
                u.setEmail("srishanth@intervai.com");
                u.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Srishanth");
                userRepository.save(u);
                log.info("Updated existing demo student to V Srishanth (srishanth@intervai.com)");
            });
        }

        // 4. Demo Admin User: Admin
        if (!userRepository.existsByEmail("admin@intervai.com")) {
            User admin = User.builder()
                    .name("Platform Admin")
                    .email("admin@intervai.com")
                    .password(passwordEncoder.encode("admin123"))
                    .targetRole("Site Administrator")
                    .experience("5+ years")
                    .careerGoal("Platform Governance")
                    .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Admin")
                    .interviewStreak(12)
                    .roles(Set.of(adminRole, studentRole))
                    .build();

            userRepository.save(admin);
            log.info("Default admin user seeded: admin@intervai.com / admin123");
        }
    }

    private void seedConfiguredAdmin(Role studentRole, Role adminRole) {
        boolean hasEmail = bootstrapAdminEmail != null && !bootstrapAdminEmail.isBlank();
        boolean hasPassword = bootstrapAdminPassword != null && !bootstrapAdminPassword.isBlank();
        if (!hasEmail && !hasPassword) return;
        if (!hasEmail || !hasPassword) {
            throw new IllegalStateException("Set both ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap a production administrator");
        }
        if (bootstrapAdminPassword.length() < 16) {
            throw new IllegalStateException("ADMIN_PASSWORD must be at least 16 characters for production admin bootstrap");
        }

        String email = bootstrapAdminEmail.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) return;

        User admin = User.builder()
                .name("Platform Admin")
                .email(email)
                .password(passwordEncoder.encode(bootstrapAdminPassword))
                .targetRole("Site Administrator")
                .experience("5+ years")
                .careerGoal("Platform Governance")
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Admin")
                .interviewStreak(0)
                .roles(Set.of(adminRole, studentRole))
                .build();
        userRepository.save(admin);
        log.info("Configured bootstrap administrator created: {}", email);
    }

    private void seedPerformance(User user, String skillName, int score, int count) {
        performanceRepository.save(Performance.builder()
                .user(user)
                .skillName(skillName)
                .score(score)
                .totalQuestionsEvaluated(count)
                .build());
    }

    private void seedSampleInterview(User user, String role, String type, String diff, int overall,
                                     int tech, int comm, int rel, int clar, int conf,
                                     LocalDateTime completedAt, int questionsCount,
                                     List<String> strengths, List<String> weaknesses, List<String> suggestions) throws Exception {

        Interview interview = Interview.builder()
                .user(user)
                .jobRole(role)
                .experience("Fresher")
                .skills("React,JavaScript,REST APIs")
                .interviewType(type)
                .difficulty(diff)
                .numberOfQuestions(questionsCount)
                .interviewMode("Text")
                .status("COMPLETED")
                .overallScore(overall)
                .technicalKnowledgeScore(tech)
                .communicationScore(comm)
                .relevanceScore(rel)
                .clarityScore(clar)
                .confidenceScore(conf)
                .summaryFeedback("Impressive performance demonstrating strong foundational mastery for " + role + ".")
                .strengthsJson(objectMapper.writeValueAsString(strengths))
                .weaknessesJson(objectMapper.writeValueAsString(weaknesses))
                .recommendationsJson(objectMapper.writeValueAsString(suggestions))
                .durationSeconds(720)
                .startedAt(completedAt.minusMinutes(12))
                .completedAt(completedAt)
                .build();

        Interview saved = interviewRepository.save(interview);

        // Seed 1 question with answer & feedback
        InterviewQuestion q1 = questionRepository.save(InterviewQuestion.builder()
                .interview(saved)
                .questionOrder(1)
                .questionText("Explain the difference between useState and useEffect in React.")
                .category("Technical")
                .targetSkill("React")
                .expectedKeyPoints("State updates trigger renders; effects manage asynchronous lifecycle tasks.")
                .modelAnswer("useState manages local component state and triggers reconciliation upon changes, while useEffect handles asynchronous side effects such as data fetching or subscriptions after DOM render.")
                .build());

        Answer a1 = answerRepository.save(Answer.builder()
                .question(q1)
                .answerText("useState is used for managing component state which causes re-renders when updated. useEffect is used for side effects like API calls and DOM manipulation after rendering.")
                .timeSpentSeconds(65)
                .isSkipped(false)
                .build());

        feedbackRepository.save(Feedback.builder()
                .answer(a1)
                .score(overall)
                .technicalKnowledgeScore(tech)
                .communicationScore(comm)
                .relevanceScore(rel)
                .clarityScore(clar)
                .confidenceScore(conf)
                .strengthsJson(objectMapper.writeValueAsString(strengths))
                .weaknessesJson(objectMapper.writeValueAsString(weaknesses))
                .suggestionsJson(objectMapper.writeValueAsString(suggestions))
                .modelAnswer(q1.getModelAnswer())
                .build());
    }
}
