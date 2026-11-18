package com.intervai.entity;

/**
 * Company tiers for campus placement drives and company-specific mock interviews.
 */
public enum PlacementCompanyTier {
    TIER_1_PRODUCT("Tier-1 Product / FAANG", "Rigorous algorithmic DSA, deep system architecture, and Bar Raiser rounds", 4),
    TIER_2_GROWTH("Tier-2 High-Growth Unicorn / Mid-Size", "Practical full-stack engineering, concurrency, API design, and live debugging", 3),
    TIER_3_ENTERPRISE("Tier-3 Mass Recruiter / IT Services", "Aptitude core fundamentals, OOP, SQL, Java/Python problem solving, and HR rounds", 2);

    private final String displayName;
    private final String description;
    private final int defaultRoundCount;

    PlacementCompanyTier(String displayName, String description, int defaultRoundCount) {
        this.displayName = displayName;
        this.description = description;
        this.defaultRoundCount = defaultRoundCount;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public int getDefaultRoundCount() {
        return defaultRoundCount;
    }
}
