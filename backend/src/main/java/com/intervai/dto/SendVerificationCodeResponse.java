package com.intervai.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendVerificationCodeResponse {
    private boolean success;
    private String message;
}
