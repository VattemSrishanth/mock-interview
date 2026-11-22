package com.intervai.controller;

import com.intervai.dto.CapacityEstimateDto;
import com.intervai.dto.SystemArchitectureBlueprintDto;
import com.intervai.service.SystemArchitectureEvaluationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system-design")
@RequiredArgsConstructor
public class SystemDesignController {

    private final SystemArchitectureEvaluationService evaluationService;

    @Data
    public static class CapacityRequest {
        private long dailyActiveUsers = 500_000L;
        private double readWriteRatio = 10.0;
        private double avgPayloadKb = 2.0;
    }

    @PostMapping("/calculate-capacity")
    public ResponseEntity<CapacityEstimateDto> calculateCapacity(@RequestBody(required = false) CapacityRequest req) {
        CapacityRequest r = req != null ? req : new CapacityRequest();
        return ResponseEntity.ok(evaluationService.calculateCapacityEstimates(
                r.getDailyActiveUsers(), r.getReadWriteRatio(), r.getAvgPayloadKb()
        ));
    }

    @PostMapping("/evaluate-blueprint")
    public ResponseEntity<SystemArchitectureBlueprintDto> evaluateBlueprint(@RequestBody SystemArchitectureBlueprintDto blueprint) {
        return ResponseEntity.ok(evaluationService.evaluateBlueprint(blueprint));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<Map<String, String>>> getSystemDesignScenarios() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "tinyurl", "title", "URL Shortener (TinyURL)", "focus", "High read-to-write ratio, Base62 hashing, Redis caching"),
                Map.of("id", "uber", "title", "Ride Sharing Dispatch (Uber/Lyft)", "focus", "Geospatial indexing (Quadtree/H3), WebSocket driver tracking"),
                Map.of("id", "netflix", "title", "Global Video Streaming (Netflix)", "focus", "Multi-tier CDN edge caching, transcode workers, chunked streaming"),
                Map.of("id", "chat", "title", "Real-Time Chat Messenger (WhatsApp)", "focus", "Persistent WebSockets, Kafka pub/sub, Cassandra message archive")
        ));
    }
}
