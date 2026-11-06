package com.intervai.controller;

import com.intervai.dto.SystemHealthDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<SystemHealthDto> getHealth() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long maxMemory = runtime.maxMemory();
        long usedMemory = totalMemory - freeMemory;

        Map<String, Object> memMap = new HashMap<>();
        memMap.put("totalMb", totalMemory / (1024 * 1024));
        memMap.put("usedMb", usedMemory / (1024 * 1024));
        memMap.put("freeMb", freeMemory / (1024 * 1024));
        memMap.put("maxMb", maxMemory / (1024 * 1024));

        Map<String, Object> servicesMap = new HashMap<>();
        boolean dbHealthy = false;
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbHealthy = (result != null && result == 1);
        } catch (Exception e) {
            dbHealthy = false;
        }
        servicesMap.put("database", dbHealthy ? "UP" : "DOWN");

        long uptime = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;

        SystemHealthDto health = SystemHealthDto.builder()
                .status(dbHealthy ? "UP" : "DEGRADED")
                .timestamp(System.currentTimeMillis())
                .uptimeSeconds(uptime)
                .jvmVersion(System.getProperty("java.version"))
                .memory(memMap)
                .services(servicesMap)
                .build();

        return ResponseEntity.ok(health);
    }
}
