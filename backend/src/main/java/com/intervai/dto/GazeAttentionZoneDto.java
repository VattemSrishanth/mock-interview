package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GazeAttentionZoneDto {
    private double centerScreenPercentage; // Optimal gaze (e.g. 85.0%)
    private double leftLookawayPercentage;
    private double rightLookawayPercentage;
    private double downwardLookawayPercentage; // Candidate looking at notes/phone
    private String primaryGazeFocus; // CENTER, OFF_SCREEN, DUAL_MONITOR
}
