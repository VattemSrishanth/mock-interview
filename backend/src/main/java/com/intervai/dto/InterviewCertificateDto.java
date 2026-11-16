package com.intervai.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewCertificateDto {
    private String certificateId;
    private String shareToken;
    private String candidateName;
    private String jobRole;
    private String interviewType;
    private String difficulty;
    private Integer overallScore;
    private String readinessTier;
    private LocalDateTime issuedAt;
    private String signatureHash;
    private boolean verified;
    private String verificationUrl;
    private String issuer;
}
