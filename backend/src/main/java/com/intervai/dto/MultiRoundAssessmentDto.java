package com.intervai.dto;

import com.intervai.entity.AssessmentPipelineStatus;
import com.intervai.entity.PlacementCompanyTier;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MultiRoundAssessmentDto {
    private String pipelineId;
    private String companyName;
    private PlacementCompanyTier companyTier;
    private String targetRole;
    private int currentRoundIndex;
    private int totalRounds;
    private AssessmentPipelineStatus status;
    private double cumulativeScore;
    private double cutoffThreshold;
    private List<AssessmentRoundResultDto> roundResults = new ArrayList<>();
    private LocalDateTime startedAt;
    private LocalDateTime updatedAt;

    public MultiRoundAssessmentDto() {
        this.startedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public MultiRoundAssessmentDto(String pipelineId, String companyName, PlacementCompanyTier companyTier, 
                                  String targetRole, int totalRounds, double cutoffThreshold) {
        this();
        this.pipelineId = pipelineId;
        this.companyName = companyName;
        this.companyTier = companyTier;
        this.targetRole = targetRole;
        this.totalRounds = totalRounds;
        this.cutoffThreshold = cutoffThreshold;
        this.currentRoundIndex = 0;
        this.status = AssessmentPipelineStatus.IN_PROGRESS;
        this.cumulativeScore = 0.0;
    }

    public String getPipelineId() { return pipelineId; }
    public void setPipelineId(String pipelineId) { this.pipelineId = pipelineId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public PlacementCompanyTier getCompanyTier() { return companyTier; }
    public void setCompanyTier(PlacementCompanyTier companyTier) { this.companyTier = companyTier; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public int getCurrentRoundIndex() { return currentRoundIndex; }
    public void setCurrentRoundIndex(int currentRoundIndex) { this.currentRoundIndex = currentRoundIndex; }

    public int getTotalRounds() { return totalRounds; }
    public void setTotalRounds(int totalRounds) { this.totalRounds = totalRounds; }

    public AssessmentPipelineStatus getStatus() { return status; }
    public void setStatus(AssessmentPipelineStatus status) { this.status = status; }

    public double getCumulativeScore() { return cumulativeScore; }
    public void setCumulativeScore(double cumulativeScore) { this.cumulativeScore = cumulativeScore; }

    public double getCutoffThreshold() { return cutoffThreshold; }
    public void setCutoffThreshold(double cutoffThreshold) { this.cutoffThreshold = cutoffThreshold; }

    public List<AssessmentRoundResultDto> getRoundResults() { return roundResults; }
    public void setRoundResults(List<AssessmentRoundResultDto> roundResults) { this.roundResults = roundResults; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
