package com.intervai.dto;

import com.intervai.entity.PricingPlanTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingPlanDto {
    private PricingPlanTier id;
    private String name;
    private String tag;
    private Long amountPaise;
    private Integer amountRupees;
    private Integer credits;
    private String description;
    private List<String> features;
    private boolean isPopular;
}
