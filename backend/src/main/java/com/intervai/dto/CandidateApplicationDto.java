package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateApplicationDto {
    private String applicationId;
    private Long candidateUserId;
    private String candidateName;
    private String candidateEmail;
    private String appliedRole; // e.g. "Full Stack Engineer"
    private String targetCompany; // e.g. "Google", "Amazon", "Campus Placement Drive"
    private RecruiterPipelineStage stage;
    private double overallScore; // 0 - 100
    private double percentileRank; // 0 - 99
    private String hiringVerdict; // STRONG_HIRE, HIRE, LEAN_HIRE, RE_EVALUATE, REJECT
    private List<String> topSkills;
    private String certificateSignature;
    private boolean proctoringVerified;
    private LocalDateTime appliedAt;
    private LocalDateTime lastEvaluatedAt;
}
