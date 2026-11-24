package com.intervai.controller;

import com.intervai.dto.SystemHealthDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final Environment environment;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    @Value("${app.code-execution.local-fallback-enabled:true}")
    private boolean codeExecutionLocalFallback;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping
    public ResponseEntity<SystemHealthDto> getHealth() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long maxMemory = runtime.maxMemory();
        long usedMemory = totalMemory - freeMemory;
        int usedPercentage = totalMemory > 0 ? (int) Math.round(((double) usedMemory / totalMemory) * 100) : 0;

        Map<String, Object> memMap = new HashMap<>();
        memMap.put("totalMb", totalMemory / (1024 * 1024));
        memMap.put("usedMb", usedMemory / (1024 * 1024));
        memMap.put("freeMb", freeMemory / (1024 * 1024));
        memMap.put("maxMb", maxMemory / (1024 * 1024));
        memMap.put("usedPercentage", usedPercentage);

        Map<String, Object> servicesMap = new HashMap<>();
        boolean dbHealthy = false;
        long dbLatencyMs = -1;
        long startDb = System.currentTimeMillis();
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbLatencyMs = System.currentTimeMillis() - startDb;
            dbHealthy = (result != null && result == 1);
        } catch (Exception e) {
            dbHealthy = false;
        }
        servicesMap.put("database", dbHealthy ? "UP" : "DOWN");
        servicesMap.put("mailService", (mailSender != null) ? "ACTIVE" : "STANDBY_INBOX");

        Map<String, Boolean> features = new HashMap<>();
        features.put("geminiAiEnabled", geminiApiKey != null && !geminiApiKey.isBlank());
        features.put("openAiEnabled", openAiApiKey != null && !openAiApiKey.isBlank());
        features.put("codeExecutionEnabled", codeExecutionLocalFallback);

        long uptime = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        int threadCount = ManagementFactory.getThreadMXBean().getThreadCount();
        int processors = runtime.availableProcessors();

        String activeEnv = environment.getActiveProfiles().length > 0
                ? String.join(",", environment.getActiveProfiles())
                : (environment.getDefaultProfiles().length > 0 ? String.join(",", environment.getDefaultProfiles()) : "dev");

        String cloudProvider = "local";
        if (System.getenv("RENDER") != null || System.getenv("RENDER_SERVICE_ID") != null) {
            cloudProvider = "render";
        } else if (System.getenv("VERCEL") != null) {
            cloudProvider = "vercel";
        } else if (System.getenv("DOCKER_CONTAINER") != null || System.getProperty("os.name", "").toLowerCase().contains("linux")) {
            cloudProvider = "container";
        }

        SystemHealthDto health = SystemHealthDto.builder()
                .status(dbHealthy ? "UP" : "DEGRADED")
                .environment(activeEnv)
                .version("1.9.0")
                .cloudProvider(cloudProvider)
                .timestamp(System.currentTimeMillis())
                .uptimeSeconds(uptime)
                .jvmVersion(System.getProperty("java.version"))
                .availableProcessors(processors)
                .threadCount(threadCount)
                .databaseLatencyMs(dbLatencyMs)
                .memory(memMap)
                .services(servicesMap)
                .features(features)
                .build();

        return ResponseEntity.ok(health);
    }
}
