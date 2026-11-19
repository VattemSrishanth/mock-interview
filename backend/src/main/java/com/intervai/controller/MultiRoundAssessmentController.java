package com.intervai.controller;

import com.intervai.dto.AssessmentRoundResultDto;
import com.intervai.dto.DailyWorkoutDto;
import com.intervai.dto.HintLadderRequest;
import com.intervai.dto.HintLadderResponse;
import com.intervai.dto.MultiRoundAssessmentDto;
import com.intervai.dto.SimulatedOfferDto;
import com.intervai.service.AdaptiveHintService;
import com.intervai.service.DailyWorkoutService;
import com.intervai.service.MultiRoundAssessmentService;
import com.intervai.service.SimulatedOfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assessment")
@CrossOrigin(origins = "*")
public class MultiRoundAssessmentController {

    private final MultiRoundAssessmentService assessmentService;
    private final AdaptiveHintService hintService;
    private final SimulatedOfferService offerService;
    private final DailyWorkoutService workoutService;

    public MultiRoundAssessmentController(MultiRoundAssessmentService assessmentService,
                                         AdaptiveHintService hintService,
                                         SimulatedOfferService offerService,
                                         DailyWorkoutService workoutService) {
        this.assessmentService = assessmentService;
        this.hintService = hintService;
        this.offerService = offerService;
        this.workoutService = workoutService;
    }

    @PostMapping("/pipeline/start")
    public ResponseEntity<MultiRoundAssessmentDto> startPipeline(@RequestBody Map<String, String> request) {
        String candidateName = request.getOrDefault("candidateName", "Candidate");
        String targetCompany = request.getOrDefault("targetCompany", "Google");
        String roleTitle = request.getOrDefault("roleTitle", "Software Development Engineer");
        MultiRoundAssessmentDto pipeline = assessmentService.createPipeline(candidateName, targetCompany, roleTitle);
        return ResponseEntity.ok(pipeline);
    }

    @GetMapping("/pipeline/{pipelineId}")
    public ResponseEntity<MultiRoundAssessmentDto> getPipeline(@PathVariable String pipelineId) {
        MultiRoundAssessmentDto pipeline = assessmentService.getPipeline(pipelineId);
        if (pipeline == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pipeline);
    }

    @PostMapping("/pipeline/{pipelineId}/submit-round")
    public ResponseEntity<MultiRoundAssessmentDto> submitRound(@PathVariable String pipelineId,
                                                              @RequestBody AssessmentRoundResultDto result) {
        MultiRoundAssessmentDto updated = assessmentService.recordRoundResult(pipelineId, result);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/hints/request")
    public ResponseEntity<HintLadderResponse> requestHint(@RequestBody HintLadderRequest request) {
        HintLadderResponse response = hintService.generateHint(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pipeline/{pipelineId}/offer")
    public ResponseEntity<SimulatedOfferDto> generateOffer(@PathVariable String pipelineId) {
        MultiRoundAssessmentDto pipeline = assessmentService.getPipeline(pipelineId);
        if (pipeline == null) {
            return ResponseEntity.notFound().build();
        }
        SimulatedOfferDto offer = offerService.generateOffer(pipeline);
        return ResponseEntity.ok(offer);
    }

    @GetMapping("/workout/today")
    public ResponseEntity<DailyWorkoutDto> getDailyWorkout() {
        return ResponseEntity.ok(workoutService.getTodayWorkout());
    }

    @PostMapping("/workout/validate")
    public ResponseEntity<Map<String, Object>> validateWorkout(@RequestBody Map<String, Integer> payload) {
        int selected = payload.getOrDefault("selectedOption", -1);
        boolean correct = workoutService.validateAnswer(selected);
        return ResponseEntity.ok(Map.of(
                "correct", correct,
                "xpEarned", correct ? 50 : 10,
                "streakBonus", correct ? 1 : 0
        ));
    }
}
