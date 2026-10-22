package com.intervai.controller;

import com.intervai.dto.InterviewResultDto;
import com.intervai.dto.ShareInterviewResponse;
import com.intervai.security.UserPrincipal;
import com.intervai.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ShareInterviewController {

    private final InterviewService interviewService;

    // Authenticated: Toggle sharing on/off for an interview
    @PostMapping("/api/interviews/{id}/share")
    public ResponseEntity<ShareInterviewResponse> toggleShare(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(interviewService.togglePublicSharing(userPrincipal.getId(), id));
    }

    // Authenticated: Get current share status
    @GetMapping("/api/interviews/{id}/share")
    public ResponseEntity<ShareInterviewResponse> getShareStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getShareStatus(userPrincipal.getId(), id));
    }

    // Public: View shared interview report (no auth required)
    @GetMapping("/api/interviews/public/{shareToken}")
    public ResponseEntity<InterviewResultDto> getPublicReport(@PathVariable String shareToken) {
        return ResponseEntity.ok(interviewService.getPublicInterviewResult(shareToken));
    }
}
