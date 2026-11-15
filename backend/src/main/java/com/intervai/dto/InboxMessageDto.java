package com.intervai.dto;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxMessageDto {
    private String id;
    private String to;
    private String from;
    private String subject;
    private String previewText;
    private String bodyHtml;
    private String code;
    private Instant sentAt;
    private boolean read;
}

