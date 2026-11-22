package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemDesignEdgeDto {
    private String id;
    private String sourceNodeId;
    private String targetNodeId;
    private String protocol; // HTTPS, GRPC, WEBSOCKET, TCP, ASYNC_EVENT
    private String bandwidth; // e.g. "10 Gbps"
    private boolean synchronous;
}
