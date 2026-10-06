package com.intervai.controller;

import com.intervai.dto.InterviewDto;
import com.intervai.security.UserPrincipal;
import com.intervai.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<List<InterviewDto>> getHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(interviewService.getUserInterviews(userPrincipal.getId()));
    }
}
