package com.intervai.controller;

import com.intervai.dto.ProctoringAuditReportDto;
import com.intervai.dto.ProctoringTelemetryDto;
import com.intervai.security.UserPrincipal;
import com.intervai.service.ProctoringAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/proctoring")
@RequiredArgsConstructor
public class ProctoringTelemetryController {

    private final ProctoringAnalysisService proctoringAnalysisService;

    @PostMapping("/telemetry")
    public ResponseEntity<ProctoringAuditReportDto> ingestTelemetry(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody ProctoringTelemetryDto telemetry) {
        String candidateName = userPrincipal != null ? userPrincipal.getUsername() : "Candidate";
        return ResponseEntity.ok(proctoringAnalysisService.evaluateSessionTelemetry(telemetry, candidateName));
    }

    @GetMapping("/audit-report/{sessionToken}")
    public ResponseEntity<ProctoringAuditReportDto> getAuditReport(@PathVariable String sessionToken) {
        return ResponseEntity.ok(proctoringAnalysisService.getReport(sessionToken));
    }
}
