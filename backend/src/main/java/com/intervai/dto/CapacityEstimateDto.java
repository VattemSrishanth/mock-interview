package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CapacityEstimateDto {
    private long dailyActiveUsers; // DAU
    private double readWriteRatio; // e.g., 10.0 (10:1 read-heavy)
    private double readQps;
    private double writeQps;
    private double peakQps;
    private double ingressBandwidthMbps;
    private double egressBandwidthMbps;
    private double dailyStorageGb;
    private double annualStorageTb;
    private double recommendedCacheMemoryGb;
}
