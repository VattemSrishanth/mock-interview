package com.intervai.dto;

import com.intervai.entity.PaymentStatus;
import com.intervai.entity.PricingPlanTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private String orderId;
    private PricingPlanTier planTier;
    private Long amountPaise;
    private Long discountAmountPaise;
    private Long finalAmountPaise;
    private Integer creditsToGrant;
    private String upiDeepLink;
    private String upiPayeeVpa;
    private String upiPayeeName;
    private PaymentStatus status;
    private String appliedReferralCode;
    private LocalDateTime createdAt;
}
