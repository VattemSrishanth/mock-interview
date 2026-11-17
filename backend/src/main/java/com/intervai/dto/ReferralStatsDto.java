package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralStatsDto {
    private String referralCode;
    private String shareUrl;
    private long friendsInvitedCount;
    private long successfulConversionsCount;
    private long bonusCreditsEarned;
    private int discountPerFriendRupees;
    private int rewardPerConversionCredits;
}
