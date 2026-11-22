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
public class ProctoringTelemetryDto {
    private String sessionToken;
    private Long candidateUserId;
    private double overallIntegrityScore; // 0 - 100
    private double windowFocusPercentage; // 0 - 100
    private int tabSwitchCount;
    private int windowBlurCount;
    private GazeAttentionZoneDto gazeDistribution;
    private List<ProctoringAnomalyType> activeAnomalies;
    private LocalDateTime timestamp;
}
