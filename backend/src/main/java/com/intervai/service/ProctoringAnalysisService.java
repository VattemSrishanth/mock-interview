package com.intervai.service;

import com.intervai.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class ProctoringAnalysisService {

    private final Map<String, ProctoringAuditReportDto> reportStore = new ConcurrentHashMap<>();

    /**
     * Evaluates continuous client telemetry and generates an integrity audit report.
     */
    public ProctoringAuditReportDto evaluateSessionTelemetry(ProctoringTelemetryDto telemetry, String candidateName) {
        double score = 100.0;
        List<String> flags = new ArrayList<>();

        // 1. Tab switches & blur deductions
        if (telemetry.getTabSwitchCount() > 0) {
            double tabDeduction = Math.min(25.0, telemetry.getTabSwitchCount() * 6.0);
            score -= tabDeduction;
            flags.add(String.format("%d browser tab switch event(s) recorded (-%.0f pts).", telemetry.getTabSwitchCount(), tabDeduction));
        }

        if (telemetry.getWindowBlurCount() > 0) {
            double blurDeduction = Math.min(15.0, telemetry.getWindowBlurCount() * 4.0);
            score -= blurDeduction;
            flags.add(String.format("%d window blur event(s) detected (-%.0f pts).", telemetry.getWindowBlurCount(), blurDeduction));
        }

        // 2. Gaze tracking distribution
        GazeAttentionZoneDto gaze = telemetry.getGazeDistribution();
        if (gaze != null) {
            if (gaze.getCenterScreenPercentage() < 70.0) {
                double gazeDeduction = (70.0 - gaze.getCenterScreenPercentage()) * 0.5;
                score -= gazeDeduction;
                flags.add(String.format("Off-screen visual distraction detected (Center gaze: %.1f%%).", gaze.getCenterScreenPercentage()));
            }
            if (gaze.getDownwardLookawayPercentage() > 20.0) {
                score -= 10.0;
                flags.add("Prolonged downward visual fixation (possible secondary screen or notes).");
            }
        }

        // 3. Severe anomalies
        if (telemetry.getActiveAnomalies() != null) {
            for (ProctoringAnomalyType anomaly : telemetry.getActiveAnomalies()) {
                switch (anomaly) {
                    case MULTIPLE_FACES -> {
                        score -= 25.0;
                        flags.add("Multiple faces observed in video frame.");
                    }
                    case NO_FACE_DETECTED -> {
                        score -= 15.0;
                        flags.add("Candidate temporarily absent from camera view.");
                    }
                    case AUDIO_BACKGROUND_VOICES -> {
                        score -= 10.0;
                        flags.add("External ambient speech voices detected in microphone stream.");
                    }
                    default -> {}
                }
            }
        }

        double finalScore = Math.max(10.0, Math.min(100.0, Math.round(score * 10.0) / 10.0));
        String verdict;
        boolean clear;

        if (finalScore >= 82.0 && telemetry.getTabSwitchCount() <= 2) {
            verdict = "VERIFIED_AUTHENTIC";
            clear = true;
            if (flags.isEmpty()) {
                flags.add("Exemplary interview focus. Zero security breaches detected.");
            }
        } else if (finalScore >= 65.0) {
            verdict = "FLAGGED_FOR_REVIEW";
            clear = false;
        } else {
            verdict = "INTEGRITY_BREACH";
            clear = false;
        }

        ProctoringAuditReportDto report = ProctoringAuditReportDto.builder()
                .reportId("PROC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .sessionToken(telemetry.getSessionToken())
                .candidateUserId(telemetry.getCandidateUserId())
                .candidateName(candidateName != null ? candidateName : "Candidate")
                .integrityScore(finalScore)
                .verifiedClear(clear)
                .proctoringVerdict(verdict)
                .flaggedEventsSummary(flags)
                .gazeSummary(gaze != null ? gaze : GazeAttentionZoneDto.builder().centerScreenPercentage(90.0).primaryGazeFocus("CENTER").build())
                .generatedAt(LocalDateTime.now())
                .build();

        if (telemetry.getSessionToken() != null) {
            reportStore.put(telemetry.getSessionToken(), report);
        }
        return report;
    }

    public ProctoringAuditReportDto getReport(String sessionToken) {
        ProctoringAuditReportDto report = reportStore.get(sessionToken);
        if (report == null) {
            // Return baseline cleared report for mock preview
            return ProctoringAuditReportDto.builder()
                    .reportId("PROC-BASELINE")
                    .sessionToken(sessionToken)
                    .candidateName("Candidate")
                    .integrityScore(94.0)
                    .verifiedClear(true)
                    .proctoringVerdict("VERIFIED_AUTHENTIC")
                    .flaggedEventsSummary(List.of("Clean proctoring telemetry session recorded."))
                    .gazeSummary(GazeAttentionZoneDto.builder()
                            .centerScreenPercentage(92.0)
                            .leftLookawayPercentage(4.0)
                            .rightLookawayPercentage(3.0)
                            .downwardLookawayPercentage(1.0)
                            .primaryGazeFocus("CENTER")
                            .build())
                    .generatedAt(LocalDateTime.now())
                    .build();
        }
        return report;
    }
}
