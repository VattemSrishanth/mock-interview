package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampusBatchInviteDto {
    private String batchId;
    private String collegeName;
    private String department; // e.g. "Computer Science & Engineering"
    private int batchYear; // e.g. 2026
    private String inviteToken;
    private String inviteUrl;
    private List<String> candidateEmails;
    private int enrolledCount;
    private LocalDateTime expiresAt;
}
