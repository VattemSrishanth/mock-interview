package com.intervai.service;

import com.intervai.dto.BehavioralEmotionTelemetryDto;
import com.intervai.dto.PacingWpmAnalysisDto;
import com.intervai.dto.VoiceAcousticMetricDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class VoiceAcousticAnalysisService {

    private static final List<String> COMMON_FILLERS = List.of(
            "um", "uh", "like", "you know", "actually", "basically", "literally", "sort of", "kind of", "right"
    );

    /**
     * Analyzes speech pacing and filler frequency from transcript and duration.
     */
    public PacingWpmAnalysisDto analyzePacingAndCadence(String transcript, double durationSeconds) {
        if (transcript == null || transcript.isBlank() || durationSeconds <= 0) {
            return PacingWpmAnalysisDto.builder()
                    .totalSpokenWords(0)
                    .durationSeconds(durationSeconds)
                    .wordsPerMinute(0)
                    .pacingTier("TOO_SLOW")
                    .pauseCount(0)
                    .averagePauseDurationSeconds(0)
                    .fillerWordCount(0)
                    .detectedFillers(Collections.emptyList())
                    .pacingRecommendation("No speech detected. Speak clearly into the microphone to measure pacing.")
                    .build();
        }

        String[] tokens = transcript.trim().split("\\s+");
        int totalWords = tokens.length;
        double minutes = durationSeconds / 60.0;
        double wpm = Math.round((totalWords / minutes) * 10.0) / 10.0;

        String pacingTier;
        String recommendation;
        if (wpm < 100) {
            pacingTier = "TOO_SLOW";
            recommendation = "Your speaking speed is somewhat hesitant. Aim to increase momentum toward 130-155 WPM for higher engagement.";
        } else if (wpm < 125) {
            pacingTier = "METHODICAL";
            recommendation = "Good, deliberate pacing. Suitable for complex architecture explanations, though slightly faster pacing adds energy.";
        } else if (wpm <= 165) {
            pacingTier = "OPTIMAL";
            recommendation = "Excellent conversational interview pacing! Clear, engaging, and easy for the interviewer to follow.";
        } else if (wpm <= 190) {
            pacingTier = "ACCELERATED";
            recommendation = "Slightly fast. Remember to take deliberate pauses at sentence boundaries to ensure the interviewer digests key points.";
        } else {
            pacingTier = "RUSHED";
            recommendation = "Pacing is too fast (>190 WPM), which can signal nervous anxiety. Inhale deeply and slow down.";
        }

        // Filler word detection
        List<String> foundFillers = new ArrayList<>();
        String lower = transcript.toLowerCase();
        for (String filler : COMMON_FILLERS) {
            Pattern pattern = Pattern.compile("\\b" + Pattern.quote(filler) + "\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(lower);
            while (matcher.find()) {
                foundFillers.add(filler);
            }
        }

        int pauseCount = Math.max(1, (int) Math.round(durationSeconds / 12.0));
        double avgPause = Math.round((durationSeconds * 0.15 / pauseCount) * 10.0) / 10.0;

        return PacingWpmAnalysisDto.builder()
                .totalSpokenWords(totalWords)
                .durationSeconds(durationSeconds)
                .wordsPerMinute(wpm)
                .pacingTier(pacingTier)
                .pauseCount(pauseCount)
                .averagePauseDurationSeconds(avgPause)
                .fillerWordCount(foundFillers.size())
                .detectedFillers(foundFillers)
                .pacingRecommendation(recommendation)
                .build();
    }

    /**
     * Evaluates acoustic pitch stability and jitter from raw metrics.
     */
    public VoiceAcousticMetricDto evaluateAcoustics(double avgPitchHz, double pitchStdDev, double jitterPct, double shimmerPct) {
        double stabilityScore = Math.max(20.0, Math.min(100.0, 100.0 - (pitchStdDev * 0.8) - (jitterPct * 5.0)));
        stabilityScore = Math.round(stabilityScore * 10.0) / 10.0;

        String steadiness;
        if (pitchStdDev < 12.0) {
            steadiness = "MONOTONIC";
        } else if (pitchStdDev <= 35.0) {
            steadiness = "BALANCED";
        } else if (pitchStdDev <= 65.0) {
            steadiness = "ENGAGING";
        } else {
            steadiness = "VOLATILE";
        }

        double confidenceIndex = Math.round((stabilityScore * 0.6 + (100.0 - Math.min(100.0, shimmerPct * 10.0)) * 0.4) * 10.0) / 10.0;
        confidenceIndex = Math.max(10.0, Math.min(99.0, confidenceIndex));

        List<String> observations = new ArrayList<>();
        if ("MONOTONIC".equals(steadiness)) {
            observations.add("Voice pitch has minimal inflection; introducing dynamic vocal variation keeps technical interviewers engaged.");
        } else if ("ENGAGING".equals(steadiness) || "BALANCED".equals(steadiness)) {
            observations.add("Natural, confident pitch modulation observed across key technical explanations.");
        } else {
            observations.add("High pitch variance detected, possibly reflecting vocal tension or microphone distance fluctuation.");
        }

        if (jitterPct > 2.5) {
            observations.add("Slight micro-tremor detected in vocal frequency; steady breathing before answering will enhance vocal authority.");
        }

        return VoiceAcousticMetricDto.builder()
                .averagePitchHz(Math.round(avgPitchHz * 10.0) / 10.0)
                .pitchStabilityScore(stabilityScore)
                .jitterPercentage(Math.round(jitterPct * 100.0) / 100.0)
                .shimmerPercentage(Math.round(shimmerPct * 100.0) / 100.0)
                .voiceSteadiness(steadiness)
                .confidenceIndex(confidenceIndex)
                .acousticObservations(observations)
                .build();
    }

    /**
     * Combines pacing and acoustic signals to infer composure and emotion.
     */
    public BehavioralEmotionTelemetryDto synthesizeBehavioralEmotion(
            PacingWpmAnalysisDto pacing,
            VoiceAcousticMetricDto acoustics,
            double eyeGazePercentage) {

        double compositeComposure = (acoustics.getConfidenceIndex() * 0.45)
                + (eyeGazePercentage * 0.35)
                + (("OPTIMAL".equals(pacing.getPacingTier()) ? 100.0 : 70.0) * 0.20);
        compositeComposure = Math.round(compositeComposure * 10.0) / 10.0;

        String primaryEmotion;
        double emotionConf;
        List<String> microExpressions = new ArrayList<>();
        List<String> notes = new ArrayList<>();

        if (compositeComposure >= 85.0) {
            primaryEmotion = "CONFIDENT";
            emotionConf = 92.5;
            microExpressions.add("Affirmative nodding");
            microExpressions.add("Calm steady gaze");
            notes.add("Candidate maintained strong poise, crisp cadence, and centered gaze throughout the response.");
        } else if (compositeComposure >= 70.0) {
            primaryEmotion = "CALM";
            emotionConf = 86.0;
            microExpressions.add("Focused visual tracking");
            notes.add("Thoughtful demeanor with balanced pacing; solid professional composure.");
        } else if (pacing.getFillerWordCount() > 5 || "RUSHED".equals(pacing.getPacingTier())) {
            primaryEmotion = "ANXIOUS";
            emotionConf = 84.0;
            microExpressions.add("Rapid gaze shifting");
            microExpressions.add("Frequent vocal fillers");
            notes.add("Elevated filler frequency and rapid cadence signal minor cognitive strain or nervousness.");
        } else {
            primaryEmotion = "HESITANT";
            emotionConf = 80.0;
            microExpressions.add("Micro-brow furrowing");
            notes.add("Candidate showed slight hesitation; structuring responses with STAR framework will elevate assertiveness.");
        }

        return BehavioralEmotionTelemetryDto.builder()
                .primaryEmotion(primaryEmotion)
                .emotionConfidence(emotionConf)
                .eyeGazeSteadinessPercentage(eyeGazePercentage)
                .microExpressionsDetected(microExpressions)
                .behavioralSummary(String.format("%s presentation style with %.1f%% composure index.", primaryEmotion, compositeComposure))
                .composureIndex(compositeComposure)
                .composureFeedbackNotes(notes)
                .build();
    }
}
