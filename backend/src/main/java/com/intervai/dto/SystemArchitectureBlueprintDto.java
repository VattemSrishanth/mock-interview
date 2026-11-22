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
public class SystemArchitectureBlueprintDto {
    private String blueprintId;
    private String title;
    private String problemScenario; // e.g. "Design URL Shortener (TinyURL)", "Design Uber Ride Dispatch"
    private List<SystemDesignNodeDto> nodes;
    private List<SystemDesignEdgeDto> edges;
    private CapacityEstimateDto capacityEstimate;
    private double scalabilityScore; // 0 - 100
    private double availabilityScore; // 0 - 100
    private List<String> detectedSinglePointsOfFailure;
    private List<String> architecturalRecommendations;
    private LocalDateTime createdAt;
}
