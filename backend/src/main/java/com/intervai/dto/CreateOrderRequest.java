package com.intervai.dto;

import com.intervai.entity.PricingPlanTier;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull(message = "Pricing plan tier is required")
    private PricingPlanTier planTier;

    private String referralCode;
}
