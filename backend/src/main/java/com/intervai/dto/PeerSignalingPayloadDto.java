package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerSignalingPayloadDto {
    private String signalType; // OFFER, ANSWER, ICE_CANDIDATE, SYNC_CODE, SYNC_NOTE, HEARTBEAT
    private String senderId;
    private String senderName;
    private String targetId;
    private Object payload;
    private long timestamp;
}
