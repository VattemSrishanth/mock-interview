package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerInterviewRoomDto {
    private String roomId;
    private String roomCode;
    private Long hostUserId;
    private String hostUserName;
    private Long peerUserId;
    private String peerUserName;
    private String targetRole;
    private String difficultyLevel;
    private PeerSessionStatus status;
    private int currentRound;
    private String activeCodingQuestion;
    private String sharedCodeSnapshot;
    private PeerRubricEvaluationDto hostEvaluation;
    private PeerRubricEvaluationDto peerEvaluation;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
