package com.intervai.dto;

import java.time.LocalDate;
import java.util.List;

public class DailyWorkoutDto {
    private String workoutId;
    private LocalDate workoutDate;
    private String dailyFocusTopic;
    private String rapidConceptQuestion;
    private List<String> conceptOptions;
    private int correctOptionIndex;
    private String conceptExplanation;
    private String quickCodePrompt;
    private String codeStarterSnippet;
    private String targetExpectedComplexity;
    private int xpReward;

    public DailyWorkoutDto() {}

    public String getWorkoutId() { return workoutId; }
    public void setWorkoutId(String workoutId) { this.workoutId = workoutId; }

    public LocalDate getWorkoutDate() { return workoutDate; }
    public void setWorkoutDate(LocalDate workoutDate) { this.workoutDate = workoutDate; }

    public String getDailyFocusTopic() { return dailyFocusTopic; }
    public void setDailyFocusTopic(String dailyFocusTopic) { this.dailyFocusTopic = dailyFocusTopic; }

    public String getRapidConceptQuestion() { return rapidConceptQuestion; }
    public void setRapidConceptQuestion(String rapidConceptQuestion) { this.rapidConceptQuestion = rapidConceptQuestion; }

    public List<String> getConceptOptions() { return conceptOptions; }
    public void setConceptOptions(List<String> conceptOptions) { this.conceptOptions = conceptOptions; }

    public int getCorrectOptionIndex() { return correctOptionIndex; }
    public void setCorrectOptionIndex(int correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }

    public String getConceptExplanation() { return conceptExplanation; }
    public void setConceptExplanation(String conceptExplanation) { this.conceptExplanation = conceptExplanation; }

    public String getQuickCodePrompt() { return quickCodePrompt; }
    public void setQuickCodePrompt(String quickCodePrompt) { this.quickCodePrompt = quickCodePrompt; }

    public String getCodeStarterSnippet() { return codeStarterSnippet; }
    public void setCodeStarterSnippet(String codeStarterSnippet) { this.codeStarterSnippet = codeStarterSnippet; }

    public String getTargetExpectedComplexity() { return targetExpectedComplexity; }
    public void setTargetExpectedComplexity(String targetExpectedComplexity) { this.targetExpectedComplexity = targetExpectedComplexity; }

    public int getXpReward() { return xpReward; }
    public void setXpReward(int xpReward) { this.xpReward = xpReward; }
}
