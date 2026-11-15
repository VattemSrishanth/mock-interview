package com.intervai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendVerificationCodeRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,63}$",
        message = "Please provide a valid email address with a valid domain (e.g. candidate@example.com)"
    )
    private String email;
}

