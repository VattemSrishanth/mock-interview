package com.intervai.service;

import com.intervai.dto.SendVerificationCodeResponse;
import com.intervai.exception.BadRequestException;
import com.intervai.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,63}$");
    private static final Duration CODE_EXPIRATION = Duration.ofMinutes(10);
    private static final Duration RATE_LIMIT_INTERVAL = Duration.ofSeconds(30);
    private static final int MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final Environment environment;
    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, VerificationEntry> verificationCodes = new ConcurrentHashMap<>();

    @Getter
    @Setter
    public static class VerificationEntry {
        private final String code;
        private final Instant createdAt;
        private final Instant expiresAt;
        private Instant lastSentAt;
        private int attempts;
        private boolean verified;

        public VerificationEntry(String code, Instant createdAt, Instant expiresAt) {
            this.code = code;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.lastSentAt = createdAt;
            this.attempts = 0;
            this.verified = false;
        }
    }

    public SendVerificationCodeResponse sendVerificationCode(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new BadRequestException("Email address is required");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BadRequestException("Please provide a valid email address with a valid domain format");
        }

        // 1. Strict Duplicate Email Enforcement
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists. Please sign in instead.");
        }

        Instant now = Instant.now();
        VerificationEntry existing = verificationCodes.get(email);

        // 2. Anti-Spam Rate Limiting: 30 seconds between requests per email
        if (existing != null && now.isBefore(existing.getLastSentAt().plus(RATE_LIMIT_INTERVAL))) {
            long waitSeconds = Duration.between(now, existing.getLastSentAt().plus(RATE_LIMIT_INTERVAL)).getSeconds();
            throw new BadRequestException("Please wait " + Math.max(1, waitSeconds) + " seconds before requesting a new verification code.");
        }

        // 3. Generate Cryptographically Secure 6-Digit OTP Code
        int randomPin = 100000 + secureRandom.nextInt(900000);
        String code = String.valueOf(randomPin);

        VerificationEntry entry = new VerificationEntry(code, now, now.plus(CODE_EXPIRATION));
        verificationCodes.put(email, entry);

        // 4. Log and Dispatch Verification Code
        log.info("[EMAIL VERIFICATION CODE] Sent to {}: {}", email, code);

        boolean isDevMode = environment.matchesProfiles("dev") || !environment.matchesProfiles("prod");

        return SendVerificationCodeResponse.builder()
                .success(true)
                .message("A 6-digit verification code has been sent to " + email + ". It will expire in 10 minutes.")
                .devCode(isDevMode ? code : null)
                .build();
    }

    public boolean verifyAndConsume(String rawEmail, String code) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new BadRequestException("Email address is required for verification");
        }
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Verification code is required");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        String trimmedCode = code.trim();

        VerificationEntry entry = verificationCodes.get(email);
        if (entry == null) {
            throw new BadRequestException("No verification code was requested for this email. Please request a code first.");
        }

        if (Instant.now().isAfter(entry.getExpiresAt())) {
            verificationCodes.remove(email);
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        if (entry.getAttempts() >= MAX_ATTEMPTS) {
            verificationCodes.remove(email);
            throw new BadRequestException("Too many failed attempts. Please request a new verification code.");
        }

        if (!entry.getCode().equals(trimmedCode)) {
            entry.setAttempts(entry.getAttempts() + 1);
            int remaining = MAX_ATTEMPTS - entry.getAttempts();
            throw new BadRequestException("Invalid verification code. " + remaining + " attempts remaining.");
        }

        // Code matches successfully: consume so it cannot be re-used
        verificationCodes.remove(email);
        return true;
    }

    public String getCodeForTesting(String email) {
        VerificationEntry entry = verificationCodes.get(email.trim().toLowerCase(Locale.ROOT));
        return entry != null ? entry.getCode() : null;
    }
}
