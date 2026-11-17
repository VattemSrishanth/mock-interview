package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletSummaryDto {
    private Integer creditsBalance;
    private Integer freeInterviewsRemaining;
    private Integer totalAvailableInterviews;
    private String referralCode;
    private String referredByCode;
    private Integer totalInterviewsCompleted;
    private boolean canStartInterview;
    private Integer referralBonusEarnedCredits;
}
