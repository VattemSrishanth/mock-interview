package com.intervai.service;

import com.intervai.dto.CapacityEstimateDto;
import com.intervai.dto.SystemArchitectureBlueprintDto;
import com.intervai.dto.SystemDesignEdgeDto;
import com.intervai.dto.SystemDesignNodeDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class SystemArchitectureEvaluationService {

    /**
     * Calculates mathematical back-of-the-envelope capacity estimates based on DAU and ratios.
     */
    public CapacityEstimateDto calculateCapacityEstimates(long dau, double readWriteRatio, double avgPayloadKb) {
        long effectiveDau = Math.max(10_000L, dau);
        double ratio = Math.max(1.0, readWriteRatio);
        double payloadKb = Math.max(0.5, avgPayloadKb);

        // Daily requests: Assume average 25 interactions per user/day
        long totalDailyRequests = effectiveDau * 25L;
        double secondsPerDay = 86_400.0;
        double avgQps = totalDailyRequests / secondsPerDay;

        double writePct = 1.0 / (ratio + 1.0);
        double readPct = ratio / (ratio + 1.0);

        double writeQps = Math.round(avgQps * writePct * 10.0) / 10.0;
        double readQps = Math.round(avgQps * readPct * 10.0) / 10.0;
        double peakQps = Math.round((readQps + writeQps) * 2.5 * 10.0) / 10.0;

        // Bandwidth
        double ingressMbps = Math.round((writeQps * payloadKb * 8.0 / 1024.0) * 100.0) / 100.0;
        double egressMbps = Math.round((readQps * payloadKb * 1.5 * 8.0 / 1024.0) * 100.0) / 100.0;

        // Daily storage in GB
        double dailyStorageGb = Math.round((writeQps * payloadKb * secondsPerDay / (1024.0 * 1024.0)) * 10.0) / 10.0;
        double annualStorageTb = Math.round((dailyStorageGb * 365.0 / 1024.0) * 10.0) / 10.0;

        // 80/20 rule: Cache top 20% of daily read volume
        double cacheMemoryGb = Math.round((dailyStorageGb * 0.20) * 10.0) / 10.0;

        return CapacityEstimateDto.builder()
                .dailyActiveUsers(effectiveDau)
                .readWriteRatio(ratio)
                .readQps(readQps)
                .writeQps(writeQps)
                .peakQps(peakQps)
                .ingressBandwidthMbps(ingressMbps)
                .egressBandwidthMbps(egressMbps)
                .dailyStorageGb(dailyStorageGb)
                .annualStorageTb(annualStorageTb)
                .recommendedCacheMemoryGb(cacheMemoryGb)
                .build();
    }

    /**
     * Evaluates architectural diagram for SPOFs, caching tiers, and resilience.
     */
    public SystemArchitectureBlueprintDto evaluateBlueprint(SystemArchitectureBlueprintDto blueprint) {
        List<SystemDesignNodeDto> nodes = blueprint.getNodes() != null ? blueprint.getNodes() : Collections.emptyList();
        List<SystemDesignEdgeDto> edges = blueprint.getEdges() != null ? blueprint.getEdges() : Collections.emptyList();

        List<String> spofs = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        boolean hasLoadBalancer = false;
        boolean hasCache = false;
        boolean hasQueue = false;
        boolean hasDatabase = false;

        for (SystemDesignNodeDto node : nodes) {
            String type = node.getType() != null ? node.getType().toUpperCase() : "";
            if (type.contains("LOAD_BALANCER")) hasLoadBalancer = true;
            if (type.contains("CACHE")) hasCache = true;
            if (type.contains("QUEUE")) hasQueue = true;
            if (type.contains("DATABASE")) {
                hasDatabase = true;
                if (node.getInstances() <= 1 && !"MULTI_REGION".equals(node.getReplicationStrategy())
                        && !"MASTER_SLAVE".equals(node.getReplicationStrategy())) {
                    spofs.add(String.format("Database node [%s] is a Single Point of Failure (1 instance, no replica).", node.getLabel()));
                }
            }
            if (node.getInstances() <= 1 && "MICROSERVICE".equals(type)) {
                spofs.add(String.format("Service [%s] runs on a single instance without auto-scaling redundancy.", node.getLabel()));
            }
        }

        // Structural recommendations
        if (!hasLoadBalancer && nodes.size() > 2) {
            recommendations.add("Introduce a redundant Load Balancer (e.g. Nginx, ALB) in front of application services to distribute ingress traffic.");
        }
        if (!hasCache && hasDatabase) {
            recommendations.add("Provision a distributed caching layer (e.g., Redis or Memcached) to offload hot read queries from the database.");
        }
        if (!hasQueue && blueprint.getCapacityEstimate() != null && blueprint.getCapacityEstimate().getWriteQps() > 1000) {
            recommendations.add("Incorporate an asynchronous message queue (e.g. Apache Kafka) to buffer high-throughput write bursts.");
        }
        if (spofs.isEmpty()) {
            recommendations.add("Excellent redundancy! Critical path components employ multi-instance clustering.");
        }

        double baseScore = 70.0;
        if (hasLoadBalancer) baseScore += 10.0;
        if (hasCache) baseScore += 10.0;
        if (hasQueue) baseScore += 5.0;
        baseScore -= (spofs.size() * 12.0);

        double scalabilityScore = Math.max(30.0, Math.min(99.0, baseScore));
        double availabilityScore = Math.max(35.0, Math.min(99.0, 100.0 - (spofs.size() * 15.0)));

        blueprint.setScalabilityScore(Math.round(scalabilityScore * 10.0) / 10.0);
        blueprint.setAvailabilityScore(Math.round(availabilityScore * 10.0) / 10.0);
        blueprint.setDetectedSinglePointsOfFailure(spofs);
        blueprint.setArchitecturalRecommendations(recommendations);
        if (blueprint.getCreatedAt() == null) {
            blueprint.setCreatedAt(LocalDateTime.now());
        }

        return blueprint;
    }
}
