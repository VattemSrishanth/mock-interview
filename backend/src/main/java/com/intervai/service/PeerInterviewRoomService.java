package com.intervai.service;

import com.intervai.dto.*;
import com.intervai.exception.BadRequestException;
import com.intervai.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PeerInterviewRoomService {

    private final Map<String, PeerInterviewRoomDto> roomStore = new ConcurrentHashMap<>();
    private final Map<String, List<PeerSignalingPayloadDto>> signalBuffer = new ConcurrentHashMap<>();

    private static final List<String> SAMPLE_CODING_CHALLENGES = List.of(
            "// Problem: Design an in-memory Key-Value store with TTL and prefix search.\n" +
            "class KeyValueStore {\n" +
            "    public void set(String key, String value, long ttlMs) {\n" +
            "        // Implement thread-safe storage\n" +
            "    }\n" +
            "    public String get(String key) {\n" +
            "        return null;\n" +
            "    }\n" +
            "}",
            "// Problem: Merge overlapping time intervals and return minimal coverage.\n" +
            "function mergeIntervals(intervals) {\n" +
            "    // Write your solution here\n" +
            "    return [];\n" +
            "}",
            "// Problem: Find the longest substring with at most K distinct characters.\n" +
            "public int lengthOfLongestSubstringKDistinct(String s, int k) {\n" +
            "    // Two-pointer sliding window approach\n" +
            "    return 0;\n" +
            "}"
    );

    public PeerInterviewRoomDto createRoom(Long hostUserId, String hostUserName, String targetRole, String difficultyLevel) {
        evictExpiredRooms();
        String roomCode = generateRoomCode();
        String roomId = UUID.randomUUID().toString();

        Random random = new Random();
        String initialCode = SAMPLE_CODING_CHALLENGES.get(random.nextInt(SAMPLE_CODING_CHALLENGES.size()));

        PeerInterviewRoomDto room = PeerInterviewRoomDto.builder()
                .roomId(roomId)
                .roomCode(roomCode)
                .hostUserId(hostUserId)
                .hostUserName(hostUserName != null ? hostUserName : "Candidate A")
                .targetRole(targetRole != null ? targetRole : "Full Stack Software Engineer")
                .difficultyLevel(difficultyLevel != null ? difficultyLevel : "INTERMEDIATE")
                .status(PeerSessionStatus.WAITING_FOR_PEER)
                .currentRound(1)
                .activeCodingQuestion("Collaborative Problem Solving & System Architecture")
                .sharedCodeSnapshot(initialCode)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(3))
                .build();

        roomStore.put(roomCode.toUpperCase(), room);
        signalBuffer.put(roomCode.toUpperCase(), Collections.synchronizedList(new ArrayList<>()));
        log.info("Created peer interview room [{}] by host [{}]", roomCode, hostUserName);
        return room;
    }

    public PeerInterviewRoomDto joinRoom(String roomCode, Long peerUserId, String peerUserName) {
        String code = roomCode.toUpperCase().trim();
        PeerInterviewRoomDto room = roomStore.get(code);
        if (room == null) {
            throw new ResourceNotFoundException("Peer interview room not found for code: " + roomCode);
        }

        if (room.getStatus() == PeerSessionStatus.COMPLETED || room.getStatus() == PeerSessionStatus.CANCELLED) {
            throw new BadRequestException("This peer interview room session has already concluded.");
        }

        // Reconnection check
        if (Objects.equals(room.getHostUserId(), peerUserId)) {
            return room;
        }

        if (room.getPeerUserId() != null && !Objects.equals(room.getPeerUserId(), peerUserId)) {
            throw new BadRequestException("This peer interview room is already full with another candidate.");
        }

        room.setPeerUserId(peerUserId);
        room.setPeerUserName(peerUserName != null ? peerUserName : "Candidate B");
        room.setStatus(PeerSessionStatus.READY);
        log.info("User [{}] joined peer room [{}]", peerUserName, code);
        return room;
    }

    public PeerInterviewRoomDto getRoom(String roomCode) {
        String code = roomCode.toUpperCase().trim();
        PeerInterviewRoomDto room = roomStore.get(code);
        if (room == null) {
            throw new ResourceNotFoundException("Room not found: " + roomCode);
        }
        return room;
    }

    public PeerInterviewRoomDto updateCodeSnapshot(String roomCode, String updatedCode) {
        PeerInterviewRoomDto room = getRoom(roomCode);
        room.setSharedCodeSnapshot(updatedCode);
        if (room.getStatus() == PeerSessionStatus.READY) {
            room.setStatus(PeerSessionStatus.IN_PROGRESS);
        }
        return room;
    }

    public PeerInterviewRoomDto submitPeerEvaluation(String roomCode, Long reviewerUserId, PeerRubricEvaluationDto rubric) {
        PeerInterviewRoomDto room = getRoom(roomCode);

        double avg = (rubric.getProblemSolvingScore() + rubric.getTechnicalAccuracyScore()
                + rubric.getCommunicationScore() + rubric.getCodeQualityScore()) / 4.0;
        rubric.setOverallAverageScore(Math.round(avg * 10.0) / 10.0);
        rubric.setReviewerUserId(reviewerUserId);

        if (Objects.equals(room.getHostUserId(), reviewerUserId)) {
            room.setHostEvaluation(rubric);
        } else {
            room.setPeerEvaluation(rubric);
        }

        if (room.getHostEvaluation() != null && room.getPeerEvaluation() != null) {
            room.setStatus(PeerSessionStatus.COMPLETED);
        } else {
            room.setStatus(PeerSessionStatus.EVALUATING);
        }

        return room;
    }

    public PeerSignalingPayloadDto routeSignaling(String roomCode, PeerSignalingPayloadDto signal) {
        String code = roomCode.toUpperCase().trim();
        List<PeerSignalingPayloadDto> queue = signalBuffer.get(code);
        if (queue != null) {
            signal.setTimestamp(System.currentTimeMillis());
            queue.add(signal);
            if (queue.size() > 50) {
                queue.remove(0);
            }
        }
        return signal;
    }

    public List<PeerSignalingPayloadDto> pollSignals(String roomCode, String recipientId) {
        String code = roomCode.toUpperCase().trim();
        List<PeerSignalingPayloadDto> queue = signalBuffer.get(code);
        if (queue == null) {
            return Collections.emptyList();
        }
        synchronized (queue) {
            return queue.stream()
                    .filter(s -> recipientId == null || recipientId.equalsIgnoreCase(s.getTargetId()) || "ALL".equalsIgnoreCase(s.getTargetId()))
                    .collect(Collectors.toList());
        }
    }

    public List<PeerInterviewRoomDto> listActiveRooms() {
        evictExpiredRooms();
        return roomStore.values().stream()
                .filter(r -> r.getStatus() != PeerSessionStatus.COMPLETED && r.getStatus() != PeerSessionStatus.CANCELLED)
                .sorted(Comparator.comparing(PeerInterviewRoomDto::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    private void evictExpiredRooms() {
        LocalDateTime now = LocalDateTime.now();
        roomStore.entrySet().removeIf(e -> e.getValue().getExpiresAt() != null && e.getValue().getExpiresAt().isBefore(now));
    }

    private String generateRoomCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder(6);
        Random r = new Random();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(r.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
