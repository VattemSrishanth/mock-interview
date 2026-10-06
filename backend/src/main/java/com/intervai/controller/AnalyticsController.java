package com.intervai.controller;

import com.intervai.dto.AnalyticsDto;
import com.intervai.security.UserPrincipal;
import com.intervai.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsDto> getAnalytics(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(userPrincipal.getId()));
    }
}
