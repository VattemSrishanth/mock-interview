package com.intervai.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareInterviewResponse {
    private Long interviewId;
    private Boolean isPubliclyShared;
    private String shareToken;
    private String shareUrl;
}
