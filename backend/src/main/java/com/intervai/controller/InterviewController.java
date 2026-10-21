package com.intervai.controller;

import com.intervai.dto.*;
import com.intervai.security.UserPrincipal;
import com.intervai.service.InterviewService;
import com.intervai.service.ResumeParserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final ResumeParserService resumeParserService;

    @PostMapping(value = "/parse-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeParseResponse> parseResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        ResumeParseResponse response = resumeParserService.parseResumeFile(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze-text")
    public ResponseEntity<ResumeParseResponse> analyzeText(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "");
        ResumeParseResponse response = resumeParserService.analyzeResumeText(text);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<InterviewDto> createInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateInterviewRequest request) {
        InterviewDto interview = interviewService.createInterview(userPrincipal.getId(), request);
        return new ResponseEntity<>(interview, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InterviewDto>> getUserInterviews(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(interviewService.getUserInterviews(userPrincipal.getId()));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<InterviewDto>> getRecentInterviews(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(interviewService.getRecentInterviews(userPrincipal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDto> getInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getInterview(userPrincipal.getId(), id));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<InterviewDto> startInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(interviewService.startInterview(userPrincipal.getId(), id));
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<InterviewQuestionDto> submitAnswer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody SubmitAnswerRequest request) {
        InterviewQuestionDto evaluatedQuestion = interviewService.submitAnswer(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(evaluatedQuestion);
    }

    @PostMapping("/{id}/follow-up")
    public ResponseEntity<InterviewQuestionDto> submitFollowUp(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody SubmitFollowUpRequest request) {
        InterviewQuestionDto evaluatedQuestion = interviewService.submitFollowUp(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(evaluatedQuestion);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<InterviewResultDto> completeInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        InterviewResultDto result = interviewService.completeInterview(userPrincipal.getId(), id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/result")
    public ResponseEntity<InterviewResultDto> getInterviewResult(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        InterviewResultDto result = interviewService.getInterviewResult(userPrincipal.getId(), id);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteInterview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        interviewService.deleteInterview(userPrincipal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Interview deleted successfully"));
    }
}
