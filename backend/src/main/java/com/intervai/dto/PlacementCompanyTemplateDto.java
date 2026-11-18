package com.intervai.dto;

import com.intervai.entity.PlacementCompanyTier;
import lombok.*;
import java.util.List;

/**
 * Pre-calibrated placement company template data transfer object.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementCompanyTemplateDto {

    private String companyName;
    private String slug;
    private PlacementCompanyTier tier;
    private String logoKey;
    private String targetRole;
    private String primaryFocus;
    private String averagePackageLpa;
    private int roundsCount;
    private List<String> roundNames;
    private List<String> commonTopics;
    private double cutOffPercentage;
    private boolean isFeatured;
    private String recruiterProTip;
}
