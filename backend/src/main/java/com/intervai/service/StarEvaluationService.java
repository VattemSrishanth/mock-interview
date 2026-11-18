package com.intervai.service;

import com.intervai.dto.StarEvaluationResultDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Evaluates candidate responses against the STAR (Situation, Task, Action, Result) methodology.
 */
@Service
public class StarEvaluationService {

    public StarEvaluationResultDto evaluateAnswer(String question, String answer) {
        if (answer == null || answer.trim().isEmpty()) {
            return StarEvaluationResultDto.builder()
                    .situationScore(0)
                    .situationFeedback("No response provided to identify the context or situation.")
                    .taskScore(0)
                    .taskFeedback("No goal or challenge was outlined.")
                    .actionScore(0)
                    .actionFeedback("No specific steps taken by the candidate were detailed.")
                    .resultScore(0)
                    .resultFeedback("No outcome or measurable metrics were provided.")
                    .overallStarScore(0)
                    .starVerdict("Incomplete Response")
                    .detectedStrengths(List.of())
                    .actionableImprovements(List.of("Provide a complete narrative outlining the Situation, Task, Action, and Result."))
                    .build();
        }

        String lower = answer.toLowerCase(Locale.ROOT);
        int words = answer.trim().split("\\s+").length;

        // 1. Situation Analysis
        boolean hasSituationContext = lower.contains("when") || lower.contains("during") || lower.contains("at my")
                || lower.contains("project") || lower.contains("hackathon") || lower.contains("internship")
                || lower.contains("team") || lower.contains("while working");
        int situationScore = hasSituationContext ? (words > 40 ? 8 : 6) : 4;
        String situationFeedback = hasSituationContext
                ? "Clear contextual backdrop established for the challenge."
                : "Context was somewhat vague. Explicitly mention the team, timeframe, or project setting.";

        // 2. Task Analysis
        boolean hasTaskContext = lower.contains("task") || lower.contains("goal") || lower.contains("objective")
                || lower.contains("challenge") || lower.contains("responsible for") || lower.contains("needed to")
                || lower.contains("problem") || lower.contains("deadline");
        int taskScore = hasTaskContext ? 8 : 5;
        String taskFeedback = hasTaskContext
                ? "The core obstacle and individual responsibility were well-demarcated."
                : "Clarify the exact scope of your personal responsibility versus the team's mandate.";

        // 3. Action Analysis (Key weight)
        boolean hasActionContext = lower.contains("i built") || lower.contains("i designed") || lower.contains("i implemented")
                || lower.contains("i researched") || lower.contains("i decided") || lower.contains("i analyzed")
                || lower.contains("my approach") || lower.contains("i solved") || lower.contains("i used");
        int actionScore = hasActionContext ? (words > 70 ? 9 : 7) : 5;
        String actionFeedback = hasActionContext
                ? "Excellent first-person agency highlighting your specific technical choices and trade-offs."
                : "Use active 'I' statements rather than generic 'we' statements to clarify your contribution.";

        // 4. Result Analysis
        boolean hasMetrics = lower.matches(".*\\b(\\d+%|\\d+ percent|increased|reduced|improved|boosted|saved|awarded|deployed|stars|users|ms|seconds)\\b.*");
        int resultScore = hasMetrics ? 9 : (lower.contains("result") || lower.contains("finally") || lower.contains("successfully") ? 6 : 4);
        String resultFeedback = hasMetrics
                ? "Strong quantifiable business/technical impact demonstrated."
                : "Ground your outcome in quantifiable metrics (e.g., latency reduction %, test coverage %, user count).";

        int overall = (int) Math.round((situationScore * 0.20 + taskScore * 0.20 + actionScore * 0.35 + resultScore * 0.25) * 10);
        overall = Math.min(100, Math.max(0, overall));

        String verdict;
        if (overall >= 85) verdict = "Exemplary STAR Structure";
        else if (overall >= 70) verdict = "Strong Placement-Ready Narrative";
        else if (overall >= 55) verdict = "Adequate Structure — Emphasize Results";
        else verdict = "Needs Structural Refinement";

        List<String> strengths = new ArrayList<>();
        if (hasSituationContext) strengths.add("Sets clear background context");
        if (hasActionContext) strengths.add("Highlights specific personal agency and actions");
        if (hasMetrics) strengths.add("Cites quantifiable impact and performance metrics");
        if (words >= 60) strengths.add("Comprehensive depth of explanation");

        List<String> improvements = new ArrayList<>();
        if (!hasMetrics) improvements.add("Add at least one concrete metric or quantifiable outcome to the Result step.");
        if (!hasActionContext) improvements.add("Use strong action verbs ('I architected', 'I optimized') instead of passive framing.");
        if (words < 50) improvements.add("Expand on technical trade-offs encountered and how you overcame roadblocks.");

        return StarEvaluationResultDto.builder()
                .situationScore(situationScore)
                .situationFeedback(situationFeedback)
                .taskScore(taskScore)
                .taskFeedback(taskFeedback)
                .actionScore(actionScore)
                .actionFeedback(actionFeedback)
                .resultScore(resultScore)
                .resultFeedback(resultFeedback)
                .overallStarScore(overall)
                .starVerdict(verdict)
                .detectedStrengths(strengths)
                .actionableImprovements(improvements)
                .build();
    }
}
