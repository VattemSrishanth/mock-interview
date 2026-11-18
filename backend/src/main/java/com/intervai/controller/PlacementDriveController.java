package com.intervai.controller;

import com.intervai.dto.PlacementCompanyTemplateDto;
import com.intervai.dto.ResumeAlignmentRequest;
import com.intervai.dto.ResumeAlignmentResponse;
import com.intervai.dto.StarEvaluationResultDto;
import com.intervai.entity.PlacementCompanyTier;
import com.intervai.service.PlacementCompanyCatalogService;
import com.intervai.service.ResumeAlignmentService;
import com.intervai.service.StarEvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller exposing REST endpoints for campus placement drive catalogs,
 * behavioral STAR evaluation, and resume role-matching analysis.
 */
@RestController
@RequestMapping("/api/placement")
@RequiredArgsConstructor
public class PlacementDriveController {

    private final PlacementCompanyCatalogService catalogService;
    private final StarEvaluationService starEvaluationService;
    private final ResumeAlignmentService resumeAlignmentService;

    @GetMapping("/companies")
    public ResponseEntity<List<PlacementCompanyTemplateDto>> getCompanies(
            @RequestParam(required = false) PlacementCompanyTier tier) {
        if (tier != null) {
            return ResponseEntity.ok(catalogService.getTemplatesByTier(tier));
        }
        return ResponseEntity.ok(catalogService.getAllTemplates());
    }

    @GetMapping("/companies/{slug}")
    public ResponseEntity<PlacementCompanyTemplateDto> getCompanyBySlug(@PathVariable String slug) {
        return catalogService.getTemplateBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/star-evaluate")
    public ResponseEntity<StarEvaluationResultDto> evaluateStar(
            @RequestBody Map<String, String> payload) {
        String question = payload.getOrDefault("question", "");
        String answer = payload.getOrDefault("answer", "");
        return ResponseEntity.ok(starEvaluationService.evaluateAnswer(question, answer));
    }

    @PostMapping("/resume-align")
    public ResponseEntity<ResumeAlignmentResponse> alignResume(
            @RequestBody ResumeAlignmentRequest request) {
        return ResponseEntity.ok(resumeAlignmentService.alignResume(request));
    }
}
