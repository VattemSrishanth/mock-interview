package com.intervai.controller;

import com.intervai.dto.*;
import com.intervai.security.UserPrincipal;
import com.intervai.service.PeerInterviewRoomService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/peer-rooms")
@RequiredArgsConstructor
public class PeerInterviewController {

    private final PeerInterviewRoomService peerInterviewRoomService;

    @Data
    public static class CreatePeerRoomRequest {
        private String targetRole = "Full Stack Software Engineer";
        private String difficultyLevel = "INTERMEDIATE";
    }

    @Data
    public static class JoinPeerRoomRequest {
        private String roomCode;
        private String participantName;
    }

    @Data
    public static class CodeUpdateRequest {
        private String code;
    }

    @PostMapping("/create")
    public ResponseEntity<PeerInterviewRoomDto> createRoom(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) CreatePeerRoomRequest req) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1001L;
        String userName = userPrincipal != null ? userPrincipal.getUsername() : "Candidate A";

        String role = req != null && req.getTargetRole() != null ? req.getTargetRole() : "Full Stack Software Engineer";
        String diff = req != null && req.getDifficultyLevel() != null ? req.getDifficultyLevel() : "INTERMEDIATE";

        PeerInterviewRoomDto room = peerInterviewRoomService.createRoom(userId, userName, role, diff);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/join")
    public ResponseEntity<PeerInterviewRoomDto> joinRoom(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody JoinPeerRoomRequest req) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : 1002L;
        String userName = userPrincipal != null ? userPrincipal.getUsername() : (req.getParticipantName() != null ? req.getParticipantName() : "Peer Candidate");

        PeerInterviewRoomDto room = peerInterviewRoomService.joinRoom(req.getRoomCode(), userId, userName);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<PeerInterviewRoomDto> getRoomDetails(@PathVariable String roomCode) {
        return ResponseEntity.ok(peerInterviewRoomService.getRoom(roomCode));
    }

    @PutMapping("/{roomCode}/code")
    public ResponseEntity<PeerInterviewRoomDto> updateCode(
            @PathVariable String roomCode,
            @RequestBody CodeUpdateRequest req) {
        return ResponseEntity.ok(peerInterviewRoomService.updateCodeSnapshot(roomCode, req.getCode()));
    }

    @PostMapping("/{roomCode}/rubric")
    public ResponseEntity<PeerInterviewRoomDto> submitRubric(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String roomCode,
            @RequestBody PeerRubricEvaluationDto rubric) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : (rubric.getReviewerUserId() != null ? rubric.getReviewerUserId() : 1001L);
        return ResponseEntity.ok(peerInterviewRoomService.submitPeerEvaluation(roomCode, userId, rubric));
    }

    @PostMapping("/{roomCode}/signal")
    public ResponseEntity<PeerSignalingPayloadDto> routeSignal(
            @PathVariable String roomCode,
            @RequestBody PeerSignalingPayloadDto signal) {
        return ResponseEntity.ok(peerInterviewRoomService.routeSignaling(roomCode, signal));
    }

    @GetMapping("/{roomCode}/signals")
    public ResponseEntity<List<PeerSignalingPayloadDto>> pollSignals(
            @PathVariable String roomCode,
            @RequestParam(required = false) String recipientId) {
        return ResponseEntity.ok(peerInterviewRoomService.pollSignals(roomCode, recipientId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<PeerInterviewRoomDto>> listActiveRooms() {
        return ResponseEntity.ok(peerInterviewRoomService.listActiveRooms());
    }
}
