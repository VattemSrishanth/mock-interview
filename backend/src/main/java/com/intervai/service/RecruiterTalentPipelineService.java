package com.intervai.service;

import com.intervai.dto.*;
import com.intervai.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RecruiterTalentPipelineService {

    private final Map<String, CandidateApplicationDto> applicationStore = new ConcurrentHashMap<>();
    private final Map<String, CampusBatchInviteDto> batchInviteStore = new ConcurrentHashMap<>();

    public RecruiterTalentPipelineService() {
        seedDemoCandidates();
    }

    public List<CandidateApplicationDto> listApplications(RecruiterPipelineStage stage, String targetCompany, Double minScore) {
        return applicationStore.values().stream()
                .filter(app -> stage == null || app.getStage() == stage)
                .filter(app -> targetCompany == null || targetCompany.isBlank() || app.getTargetCompany().equalsIgnoreCase(targetCompany.trim()))
                .filter(app -> minScore == null || app.getOverallScore() >= minScore)
                .sorted(Comparator.comparing(CandidateApplicationDto::getOverallScore).reversed())
                .collect(Collectors.toList());
    }

    public CandidateApplicationDto getApplication(String applicationId) {
        CandidateApplicationDto app = applicationStore.get(applicationId);
        if (app == null) {
            throw new ResourceNotFoundException("Candidate application not found: " + applicationId);
        }
        return app;
    }

    public CandidateApplicationDto advanceStage(String applicationId, RecruiterPipelineStage nextStage) {
        CandidateApplicationDto app = getApplication(applicationId);
        app.setStage(nextStage);
        app.setLastEvaluatedAt(LocalDateTime.now());
        log.info("Advanced application [{}] to stage [{}]", applicationId, nextStage);
        return app;
    }

    public CandidateShortlistDto createShortlist(String shortlistName, String recruiterName, List<String> applicationIds) {
        List<CandidateApplicationDto> list = applicationIds.stream()
                .map(applicationStore::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        double avgScore = list.stream().mapToDouble(CandidateApplicationDto::getOverallScore).average().orElse(0.0);

        return CandidateShortlistDto.builder()
                .shortlistId("SL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .shortlistName(shortlistName != null ? shortlistName : "Priority Shortlist")
                .recruiterName(recruiterName != null ? recruiterName : "Senior Recruiter")
                .totalCandidates(list.size())
                .averageCohortScore(Math.round(avgScore * 10.0) / 10.0)
                .candidates(list)
                .build();
    }

    public CampusBatchInviteDto createCampusBatchInvite(String collegeName, String department, int batchYear, List<String> emails) {
        String token = "CAMPUS-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String inviteUrl = "https://intervai.app/invite/" + token;

        CampusBatchInviteDto batch = CampusBatchInviteDto.builder()
                .batchId("BATCH-" + System.currentTimeMillis())
                .collegeName(collegeName != null ? collegeName : "Engineering University")
                .department(department != null ? department : "Computer Science")
                .batchYear(batchYear > 0 ? batchYear : 2026)
                .inviteToken(token)
                .inviteUrl(inviteUrl)
                .candidateEmails(emails != null ? emails : Collections.emptyList())
                .enrolledCount(0)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        batchInviteStore.put(token, batch);
        log.info("Generated campus batch invite [{}] for [{}]", token, collegeName);
        return batch;
    }

    public CampusBatchInviteDto validateBatchInvite(String token) {
        CampusBatchInviteDto batch = batchInviteStore.get(token.toUpperCase().trim());
        if (batch == null || (batch.getExpiresAt() != null && batch.getExpiresAt().isBefore(LocalDateTime.now()))) {
            throw new ResourceNotFoundException("Invalid or expired campus invitation token: " + token);
        }
        return batch;
    }

    private void seedDemoCandidates() {
        applicationStore.put("APP-101", CandidateApplicationDto.builder()
                .applicationId("APP-101")
                .candidateUserId(1001L)
                .candidateName("Srishanth Vattem")
                .candidateEmail("srishanth@intervai.com")
                .appliedRole("Senior Full Stack & AI Architect")
                .targetCompany("Google")
                .stage(RecruiterPipelineStage.SYSTEM_DESIGN_ROUND)
                .overallScore(94.5)
                .percentileRank(98.2)
                .hiringVerdict("STRONG_HIRE")
                .topSkills(List.of("Java 21", "Spring Boot", "React", "Distributed Systems", "WebRTC"))
                .certificateSignature("CERT-SIG-948194A8D")
                .proctoringVerified(true)
                .appliedAt(LocalDateTime.now().minusDays(5))
                .lastEvaluatedAt(LocalDateTime.now().minusHours(2))
                .build());

        applicationStore.put("APP-102", CandidateApplicationDto.builder()
                .applicationId("APP-102")
                .candidateUserId(1002L)
                .candidateName("Priya Sharma")
                .candidateEmail("priya.sharma@campus.edu")
                .appliedRole("Backend Cloud Engineer")
                .targetCompany("Amazon")
                .stage(RecruiterPipelineStage.TECHNICAL_ROUND)
                .overallScore(86.0)
                .percentileRank(88.5)
                .hiringVerdict("HIRE")
                .topSkills(List.of("Java", "PostgreSQL", "AWS S3", "Microservices"))
                .certificateSignature("CERT-SIG-86214B0C")
                .proctoringVerified(true)
                .appliedAt(LocalDateTime.now().minusDays(4))
                .lastEvaluatedAt(LocalDateTime.now().minusHours(8))
                .build());

        applicationStore.put("APP-103", CandidateApplicationDto.builder()
                .applicationId("APP-103")
                .candidateUserId(1003L)
                .candidateName("Rohan Verma")
                .candidateEmail("rohan.verma@tech.in")
                .appliedRole("Frontend Web Platform Engineer")
                .targetCompany("Swiggy")
                .stage(RecruiterPipelineStage.SCREENING_PASSED)
                .overallScore(79.0)
                .percentileRank(76.4)
                .hiringVerdict("LEAN_HIRE")
                .topSkills(List.of("React", "TypeScript", "Tailwind CSS", "Next.js"))
                .certificateSignature("CERT-SIG-79114D2E")
                .proctoringVerified(false)
                .appliedAt(LocalDateTime.now().minusDays(2))
                .lastEvaluatedAt(LocalDateTime.now().minusDays(1))
                .build());
    }
}
