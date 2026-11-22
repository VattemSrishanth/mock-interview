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
public class ProctoringAuditReportDto {
    private String reportId;
    private String sessionToken;
    private Long candidateUserId;
    private String candidateName;
    private double integrityScore; // 0 - 100
    private boolean verifiedClear; // True if integrity >= 80 and no severe anomalies
    private String proctoringVerdict; // VERIFIED_AUTHENTIC, FLAGGED_FOR_REVIEW, INTEGRITY_BREACH
    private List<String> flaggedEventsSummary;
    private GazeAttentionZoneDto gazeSummary;
    private LocalDateTime generatedAt;
}
