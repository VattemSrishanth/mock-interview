package com.intervai.entity;

public enum AssessmentRoundType {
    CODING_OA("Round 1: Online Coding Assessment (DSA)", 45, 100),
    TECHNICAL_DEEP_DIVE("Round 2: Technical Deep Dive & Core Engineering", 45, 100),
    SYSTEM_DESIGN("Round 3: System Architecture & Scalability", 60, 100),
    BEHAVIORAL_HR("Round 4: Bar Raiser & Behavioral Leadership", 30, 100);

    private final String title;
    private final int durationMinutes;
    private final int maxScore;

    AssessmentRoundType(String title, int durationMinutes, int maxScore) {
        this.title = title;
        this.durationMinutes = durationMinutes;
        this.maxScore = maxScore;
    }

    public String getTitle() {
        return title;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public int getMaxScore() {
        return maxScore;
    }
}
