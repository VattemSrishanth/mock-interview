package com.intervai.controller;

import com.intervai.dto.*;
import com.intervai.service.RecruiterTalentPipelineService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiter")
@RequiredArgsConstructor
public class RecruiterPortalController {

    private final RecruiterTalentPipelineService recruiterTalentPipelineService;

    @Data
    public static class AdvanceStageRequest {
        private RecruiterPipelineStage nextStage;
    }

    @Data
    public static class CreateShortlistRequest {
        private String shortlistName;
        private String recruiterName;
        private List<String> applicationIds;
    }

    @Data
    public static class CampusInviteRequest {
        private String collegeName;
        private String department;
        private int batchYear;
        private List<String> candidateEmails;
    }

    @GetMapping("/applications")
    public ResponseEntity<List<CandidateApplicationDto>> getApplications(
            @RequestParam(required = false) RecruiterPipelineStage stage,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Double minScore) {
        return ResponseEntity.ok(recruiterTalentPipelineService.listApplications(stage, company, minScore));
    }

    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<CandidateApplicationDto> getApplicationDetail(@PathVariable String applicationId) {
        return ResponseEntity.ok(recruiterTalentPipelineService.getApplication(applicationId));
    }

    @PostMapping("/applications/{applicationId}/advance")
    public ResponseEntity<CandidateApplicationDto> advanceCandidateStage(
            @PathVariable String applicationId,
            @RequestBody AdvanceStageRequest req) {
        return ResponseEntity.ok(recruiterTalentPipelineService.advanceStage(applicationId, req.getNextStage()));
    }

    @PostMapping("/shortlists")
    public ResponseEntity<CandidateShortlistDto> createCandidateShortlist(@RequestBody CreateShortlistRequest req) {
        return ResponseEntity.ok(recruiterTalentPipelineService.createShortlist(
                req.getShortlistName(), req.getRecruiterName(), req.getApplicationIds()
        ));
    }

    @PostMapping("/campus-invites")
    public ResponseEntity<CampusBatchInviteDto> createCampusInvite(@RequestBody CampusInviteRequest req) {
        return ResponseEntity.ok(recruiterTalentPipelineService.createCampusBatchInvite(
                req.getCollegeName(), req.getDepartment(), req.getBatchYear(), req.getCandidateEmails()
        ));
    }

    @GetMapping("/campus-invites/{token}")
    public ResponseEntity<CampusBatchInviteDto> validateCampusInvite(@PathVariable String token) {
        return ResponseEntity.ok(recruiterTalentPipelineService.validateBatchInvite(token));
    }
}
