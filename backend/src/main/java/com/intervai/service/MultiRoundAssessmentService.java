package com.intervai.service;

import com.intervai.dto.AssessmentRoundResultDto;
import com.intervai.dto.MultiRoundAssessmentDto;
import com.intervai.entity.AssessmentPipelineStatus;
import com.intervai.entity.AssessmentRoundType;
import com.intervai.entity.PlacementCompanyTier;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MultiRoundAssessmentService {

    private final Map<String, MultiRoundAssessmentDto> pipelineStorage = new ConcurrentHashMap<>();

    public MultiRoundAssessmentDto startPipeline(String companyName, PlacementCompanyTier companyTier, String targetRole) {
        String pipelineId = "PIPE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        double cutoff = getCutoffForTier(companyTier);
        
        MultiRoundAssessmentDto pipeline = new MultiRoundAssessmentDto(
                pipelineId,
                companyName != null && !companyName.isBlank() ? companyName : "Target Enterprise",
                companyTier != null ? companyTier : PlacementCompanyTier.TIER_2_UNIFIED,
                targetRole != null && !targetRole.isBlank() ? targetRole : "Software Development Engineer",
                4, // 4 standard recruitment rounds
                cutoff
        );
        
        pipelineStorage.put(pipelineId, pipeline);
        return pipeline;
    }

    public MultiRoundAssessmentDto getPipeline(String pipelineId) {
        MultiRoundAssessmentDto pipeline = pipelineStorage.get(pipelineId);
        if (pipeline == null) {
            // Seed a dynamic realistic pipeline if not found
            pipeline = startPipeline("Tech Placement Assessment", PlacementCompanyTier.TIER_2_UNIFIED, "Full Stack SDE");
            pipeline.setPipelineId(pipelineId);
            pipelineStorage.put(pipelineId, pipeline);
        }
        return pipeline;
    }

    public MultiRoundAssessmentDto submitRoundResult(String pipelineId, AssessmentRoundType roundType, int score,
                                                      String keyStrengths, String areasForImprovement, List<String> roundTags) {
        MultiRoundAssessmentDto pipeline = getPipeline(pipelineId);
        
        int requiredCutoff = (int) Math.round(pipeline.getCutoffThreshold());
        boolean passed = score >= requiredCutoff;
        
        AssessmentRoundResultDto roundResult = new AssessmentRoundResultDto(
                roundType,
                pipeline.getRoundResults().size() + 1,
                score,
                requiredCutoff,
                passed,
                keyStrengths != null ? keyStrengths : "Solid demonstration of problem-solving approach and technical baseline.",
                areasForImprovement != null ? areasForImprovement : "Further optimize boundary conditions and verbal articulation.",
                roundTags != null ? roundTags : List.of("Algorithm", "Problem Solving", "Efficiency")
        );
        
        pipeline.getRoundResults().add(roundResult);
        pipeline.setCurrentRoundIndex(pipeline.getRoundResults().size());
        pipeline.setUpdatedAt(LocalDateTime.now());
        
        // Recalculate cumulative average score
        double total = 0.0;
        for (AssessmentRoundResultDto r : pipeline.getRoundResults()) {
            total += r.getScore();
        }
        double cumulative = total / pipeline.getRoundResults().size();
        pipeline.setCumulativeScore(Math.round(cumulative * 10.0) / 10.0);
        
        // Update pipeline state
        if (!passed) {
            pipeline.setStatus(AssessmentPipelineStatus.ROUND_FAILED);
        } else if (pipeline.getRoundResults().size() >= pipeline.getTotalRounds()) {
            if (pipeline.getCumulativeScore() >= pipeline.getCutoffThreshold()) {
                pipeline.setStatus(AssessmentPipelineStatus.OFFER_EXTENDED);
            } else {
                pipeline.setStatus(AssessmentPipelineStatus.REJECTED);
            }
        } else {
            pipeline.setStatus(AssessmentPipelineStatus.ROUND_CLEARED);
        }
        
        return pipeline;
    }

    public double getCutoffForTier(PlacementCompanyTier tier) {
        if (tier == null) return 70.0;
        return switch (tier) {
            case TIER_1_FAANG -> 82.0;
            case TIER_2_UNIFIED -> 72.0;
            case TIER_3_ENTERPRISE_IT -> 62.0;
            default -> 70.0;
        };
    }
}
