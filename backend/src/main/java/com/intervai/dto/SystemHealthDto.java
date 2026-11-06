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
    private long timestamp;
    private long uptimeSeconds;
    private String jvmVersion;
    private Map<String, Object> memory;
    private Map<String, Object> services;
}
