package com.intervai.config;

import com.intervai.entity.*;
import com.intervai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String bootstrapAdminEmail;

    @Value("${app.admin.password:}")
    private String bootstrapAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        // 1. Core security roles
        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_STUDENT).build()));

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build()));

        // 2. Standard skills taxonomy for candidate selection
        List<String> defaultSkills = List.of(
                "React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Next.js",
                "Java", "Spring Boot", "Spring Data JPA", "Microservices", "Hibernate",
                "Python", "Django", "FastAPI",
                "SQL", "PostgreSQL", "MongoDB", "Redis",
                "AWS", "Docker", "Kubernetes", "Git", "REST APIs",
                "System Design", "Communication", "Problem Solving"
        );

        for (String skillName : defaultSkills) {
            skillRepository.findByNameIgnoreCase(skillName)
                    .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName).category("General").build()));
        }

        // 3. Optional production administrator configured securely via environment variables
        seedConfiguredAdmin(studentRole, adminRole);
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
}
