package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private String status;
    private String environment;
    private String version;
    private String cloudProvider;
    private long timestamp;
    private long uptimeSeconds;
    private String jvmVersion;
    private int availableProcessors;
    private int threadCount;
    private long databaseLatencyMs;
    private Map<String, Object> memory;
    private Map<String, Object> services;
    private Map<String, Boolean> features;
}
