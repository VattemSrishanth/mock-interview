package com.intervai.entity;

public enum PricingPlanTier {
    SINGLE_MOCK_49(4900L, 1, "Single Mock + Full PDF Scorecard", "1 AI technical interview with detailed feedback and verified certificate"),
    STARTER_PACK_149(14900L, 5, "Placement Starter Pack", "5 comprehensive AI mock interviews across technical & behavioral tracks"),
    UNLIMITED_PASS_299(29900L, 30, "30-Day Campus Pass", "Unlimited 30-day interview practice with adaptive follow-ups & code sandbox");

    private final Long amountPaise;
    private final int creditsGranted;
    private final String title;
    private final String description;

    PricingPlanTier(Long amountPaise, int creditsGranted, String title, String description) {
        this.amountPaise = amountPaise;
        this.creditsGranted = creditsGranted;
        this.title = title;
        this.description = description;
    }

    public Long getAmountPaise() {
        return amountPaise;
    }

    public int getCreditsGranted() {
        return creditsGranted;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }
}
