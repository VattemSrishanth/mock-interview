package com.intervai.dto;

import com.intervai.entity.PricingPlanTier;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateReferralRequest {
    @NotBlank(message = "Referral code is required")
    private String referralCode;

    private PricingPlanTier planTier;
}
