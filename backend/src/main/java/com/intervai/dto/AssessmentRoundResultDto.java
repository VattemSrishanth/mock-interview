package com.intervai.dto;

import com.intervai.entity.AssessmentRoundType;
import java.time.LocalDateTime;
import java.util.List;

public class AssessmentRoundResultDto {
    private AssessmentRoundType roundType;
    private String roundTitle;
    private int roundIndex;
    private int score;
    private int cutoffScore;
    private boolean passed;
    private String keyStrengths;
    private String areasForImprovement;
    private List<String> roundTags;
    private LocalDateTime completedAt;

    public AssessmentRoundResultDto() {}

    public AssessmentRoundResultDto(AssessmentRoundType roundType, int roundIndex, int score, 
                                    int cutoffScore, boolean passed, String keyStrengths, 
                                    String areasForImprovement, List<String> roundTags) {
        this.roundType = roundType;
        this.roundTitle = roundType != null ? roundType.getTitle() : "";
        this.roundIndex = roundIndex;
        this.score = score;
        this.cutoffScore = cutoffScore;
        this.passed = passed;
        this.keyStrengths = keyStrengths;
        this.areasForImprovement = areasForImprovement;
        this.roundTags = roundTags;
        this.completedAt = LocalDateTime.now();
    }

    public AssessmentRoundType getRoundType() { return roundType; }
    public void setRoundType(AssessmentRoundType roundType) { this.roundType = roundType; }

    public String getRoundTitle() { return roundTitle; }
    public void setRoundTitle(String roundTitle) { this.roundTitle = roundTitle; }

    public int getRoundIndex() { return roundIndex; }
    public void setRoundIndex(int roundIndex) { this.roundIndex = roundIndex; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getCutoffScore() { return cutoffScore; }
    public void setCutoffScore(int cutoffScore) { this.cutoffScore = cutoffScore; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public String getKeyStrengths() { return keyStrengths; }
    public void setKeyStrengths(String keyStrengths) { this.keyStrengths = keyStrengths; }

    public String getAreasForImprovement() { return areasForImprovement; }
    public void setAreasForImprovement(String areasForImprovement) { this.areasForImprovement = areasForImprovement; }

    public List<String> getRoundTags() { return roundTags; }
    public void setRoundTags(List<String> roundTags) { this.roundTags = roundTags; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
