package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralValidationDto {
    private String referralCode;
    private boolean valid;
    private String referrerName;
    private Long discountPaise;
    private Integer discountRupees;
    private String message;
}
