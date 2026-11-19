package com.intervai.dto;

import java.util.List;

public class HintLadderResponse {
    private int hintTier;
    private String hintTitle;
    private String hintContent;
    private int scorePenaltyPercent;
    private String recommendedDirection;
    private List<String> keyConsiderations;

    public HintLadderResponse() {}

    public HintLadderResponse(int hintTier, String hintTitle, String hintContent, int scorePenaltyPercent,
                              String recommendedDirection, List<String> keyConsiderations) {
        this.hintTier = hintTier;
        this.hintTitle = hintTitle;
        this.hintContent = hintContent;
        this.scorePenaltyPercent = scorePenaltyPercent;
        this.recommendedDirection = recommendedDirection;
        this.keyConsiderations = keyConsiderations;
    }

    public int getHintTier() { return hintTier; }
    public void setHintTier(int hintTier) { this.hintTier = hintTier; }

    public String getHintTitle() { return hintTitle; }
    public void setHintTitle(String hintTitle) { this.hintTitle = hintTitle; }

    public String getHintContent() { return hintContent; }
    public void setHintContent(String hintContent) { this.hintContent = hintContent; }

    public int getScorePenaltyPercent() { return scorePenaltyPercent; }
    public void setScorePenaltyPercent(int scorePenaltyPercent) { this.scorePenaltyPercent = scorePenaltyPercent; }

    public String getRecommendedDirection() { return recommendedDirection; }
    public void setRecommendedDirection(String recommendedDirection) { this.recommendedDirection = recommendedDirection; }

    public List<String> getKeyConsiderations() { return keyConsiderations; }
    public void setKeyConsiderations(List<String> keyConsiderations) { this.keyConsiderations = keyConsiderations; }
}
