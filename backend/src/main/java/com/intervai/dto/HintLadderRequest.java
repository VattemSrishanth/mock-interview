package com.intervai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class HintLadderRequest {
    @NotBlank
    private String question;

    @Min(1)
    @Max(3)
    private int hintTier; // 1: Intuition/Conceptual, 2: Optimal Data Structure, 3: Pseudo-code

    private String currentAnswerOrCode;
    private String topicOrCategory;

    public HintLadderRequest() {}

    public HintLadderRequest(String question, int hintTier, String currentAnswerOrCode, String topicOrCategory) {
        this.question = question;
        this.hintTier = hintTier;
        this.currentAnswerOrCode = currentAnswerOrCode;
        this.topicOrCategory = topicOrCategory;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public int getHintTier() { return hintTier; }
    public void setHintTier(int hintTier) { this.hintTier = hintTier; }

    public String getCurrentAnswerOrCode() { return currentAnswerOrCode; }
    public void setCurrentAnswerOrCode(String currentAnswerOrCode) { this.currentAnswerOrCode = currentAnswerOrCode; }

    public String getTopicOrCategory() { return topicOrCategory; }
    public void setTopicOrCategory(String topicOrCategory) { this.topicOrCategory = topicOrCategory; }
}
