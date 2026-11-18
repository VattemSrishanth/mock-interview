package com.intervai.service;

import com.intervai.dto.ResumeAlignmentRequest;
import com.intervai.dto.ResumeAlignmentResponse;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service that analyzes candidate resume text, maps tech competencies,
 * and computes track alignment with recommendations for mock interview tracks.
 */
@Service
public class ResumeAlignmentService {

    private static final Map<String, List<String>> ROLE_REQUIRED_SKILLS = Map.of(
            "backend", List.of("java", "spring boot", "python", "sql", "postgresql", "rest api", "docker", "microservices"),
            "frontend", List.of("react", "javascript", "typescript", "html", "css", "tailwind", "redux", "rest api"),
            "full stack", List.of("react", "node.js", "java", "spring boot", "sql", "rest api", "javascript", "postgresql"),
            "ai engineer", List.of("python", "machine learning", "nlp", "pandas", "scikit-learn", "llm", "flask", "deep learning")
    );

    private static final List<String> COMMON_TECH_SKILLS = List.of(
            "java", "python", "javascript", "typescript", "c++", "c",
            "react", "angular", "vue", "html", "css", "tailwind",
            "node.js", "express", "spring boot", "flask", "django", "fastapi",
            "sql", "postgresql", "mysql", "mongodb", "redis",
            "docker", "kubernetes", "aws", "azure", "git", "linux",
            "machine learning", "deep learning", "nlp", "pandas", "scikit-learn", "tensorflow", "pytorch",
            "rest api", "graphql", "microservices", "data structures", "algorithms"
    );

    public ResumeAlignmentResponse alignResume(ResumeAlignmentRequest request) {
        String resume = (request != null && request.getResumeText() != null)
                ? request.getResumeText().toLowerCase(Locale.ROOT)
                : "";

        String targetRole = (request != null && request.getTargetRole() != null)
                ? request.getTargetRole().toLowerCase(Locale.ROOT)
                : "full stack";

        // Extract identified skills
        List<String> identified = new ArrayList<>();
        for (String skill : COMMON_TECH_SKILLS) {
            if (resume.contains(skill)) {
                identified.add(skill);
            }
        }

        // Determine reference required skills
        String roleKey = "full stack";
        if (targetRole.contains("ai") || targetRole.contains("ml") || targetRole.contains("data")) {
            roleKey = "ai engineer";
        } else if (targetRole.contains("back")) {
            roleKey = "backend";
        } else if (targetRole.contains("front")) {
            roleKey = "frontend";
        }

        List<String> required = ROLE_REQUIRED_SKILLS.getOrDefault(roleKey, ROLE_REQUIRED_SKILLS.get("full stack"));
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : required) {
            if (identified.contains(req)) {
                matched.add(req);
            } else {
                missing.add(req);
            }
        }

        int matchPercent = required.isEmpty() ? 50 : (int) Math.round(((double) matched.size() / required.size()) * 100);
        matchPercent = Math.min(100, Math.max(20, matchPercent));

        String tier;
        String difficulty;
        if (matchPercent >= 80) {
            tier = "Placement Ready (Tier 1 Fit)";
            difficulty = "Advanced";
        } else if (matchPercent >= 60) {
            tier = "High Campus Alignment";
            difficulty = "Intermediate";
        } else if (matchPercent >= 40) {
            tier = "Moderate Fit — Focused Gaps";
            difficulty = "Intermediate";
        } else {
            tier = "Foundational Preparation Track";
            difficulty = "Beginner";
        }

        List<String> tracks = new ArrayList<>();
        if (identified.contains("react") || identified.contains("javascript")) {
            tracks.add("Frontend Engineering (React / Responsive UI)");
        }
        if (identified.contains("java") || identified.contains("spring boot") || identified.contains("postgresql")) {
            tracks.add("Backend Systems (Java / Spring Boot / DB Architecture)");
        }
        if (identified.contains("python") || identified.contains("machine learning") || identified.contains("nlp")) {
            tracks.add("Applied AI & Data Science (LLM, NLP, ML Pipeline)");
        }
        if (tracks.isEmpty()) {
            tracks.add("Full Stack Generalist Placement Track");
        }

        String summary = String.format("Found %d verified technical competencies across %d required skills for %s. Match rating: %d%% (%s).",
                identified.size(), required.size(), targetRole.toUpperCase(Locale.ROOT), matchPercent, tier);

        return ResumeAlignmentResponse.builder()
                .matchPercentage(matchPercent)
                .alignmentTier(tier)
                .identifiedSkills(identified)
                .missingKeySkills(missing)
                .recommendedInterviewTracks(tracks)
                .executiveSummary(summary)
                .suggestedInterviewDifficulty(difficulty)
                .build();
    }
}
