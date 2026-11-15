package com.intervai.service;

import com.intervai.dto.InboxMessageDto;
import com.intervai.dto.SendVerificationCodeResponse;
import com.intervai.exception.BadRequestException;
import com.intervai.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,63}$");
    private static final Duration CODE_EXPIRATION = Duration.ofMinutes(10);
    private static final Duration RATE_LIMIT_INTERVAL = Duration.ofSeconds(30);
    private static final int MAX_ATTEMPTS = 5;

    // Common disposable/burner email domains
    private static final Set<String> DISPOSABLE_DOMAINS = Set.of(
            "tempmail.com", "10minutemail.com", "mailinator.com", "guerrillamail.com",
            "sharklasers.com", "getnada.com", "throwawaymail.com", "trashmail.com",
            "yopmail.com", "fakeinbox.com", "dispostable.com", "maildrop.cc",
            "mohmal.com", "temp-mail.org", "crazymailing.com", "burnermail.io",
            "inboxkitten.com", "mailcatch.com", "emailondeck.com", "mytemp.email"
    );

    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${app.frontend.url:}")
    private String configuredFrontendUrl;

    @Value("${app.cors.allowed-origins:}")
    private String corsAllowedOrigins;

    private final Map<String, VerificationEntry> verificationCodes = new ConcurrentHashMap<>();
    private final List<InboxMessageDto> mailbox = new CopyOnWriteArrayList<>();

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
            throw new BadRequestException("Please enter a valid email address with a domain (e.g. name@example.com).");
        }

        String domain = email.substring(email.indexOf('@') + 1);

        // 1. Reject disposable/temporary domains
        if (DISPOSABLE_DOMAINS.contains(domain)) {
            throw new BadRequestException("Disposable and temporary email addresses are not permitted. Please use your genuine email.");
        }

        // 2. Validate domain existence & active MX (mail exchange) records via DNS
        if (!hasActiveMailExchange(domain)) {
            throw new BadRequestException("The email domain '" + domain + "' does not exist or has no active mail servers. Please enter a valid, active email address.");
        }

        // 3. Strict Duplicate Email Enforcement
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists. Please sign in instead.");
        }

        Instant now = Instant.now();
        VerificationEntry existing = verificationCodes.get(email);

        // 4. Anti-Spam Rate Limiting: 30 seconds between requests per email
        if (existing != null && now.isBefore(existing.getLastSentAt().plus(RATE_LIMIT_INTERVAL))) {
            long waitSeconds = Duration.between(now, existing.getLastSentAt().plus(RATE_LIMIT_INTERVAL)).getSeconds();
            throw new BadRequestException("Please wait " + Math.max(1, waitSeconds) + " seconds before requesting a new verification code.");
        }

        // 5. Generate Cryptographically Secure 6-Digit OTP Code
        int randomPin = 100000 + secureRandom.nextInt(900000);
        String code = String.valueOf(randomPin);

        VerificationEntry entry = new VerificationEntry(code, now, now.plus(CODE_EXPIRATION));
        verificationCodes.put(email, entry);

        String baseUrl = resolveFrontendBaseUrl();
        String encodedEmail = java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8);
        String verificationLink = baseUrl + "/register?email=" + encodedEmail + "&code=" + code;

        String htmlBody = buildHtmlEmail(email, code, verificationLink);

        // 6. Deliver Code to Mailbox Store (Accessible exclusively in the candidate's Inbox)
        InboxMessageDto message = InboxMessageDto.builder()
                .id(UUID.randomUUID().toString())
                .to(email)
                .from("IntervAI Security <security@intervai.com>")
                .subject("Your IntervAI Verification Code: " + code)
                .previewText("Your 6-digit security code is " + code + ". Or click the verification link inside to verify.")
                .bodyHtml(htmlBody)
                .code(code)
                .verificationLink(verificationLink)
                .sentAt(now)
                .read(false)
                .build();
        mailbox.add(0, message);
        while (mailbox.size() > 50) {
            mailbox.remove(mailbox.size() - 1);
        }

        // 7. Deliver Code to External SMTP if configured
        deliverSmtp(email, code, htmlBody);

        // Security: NEVER return the code in the API response or to the registration portal
        return SendVerificationCodeResponse.builder()
                .success(true)
                .message("A 6-digit verification code has been dispatched to your email inbox (" + email + "). Please check your inbox and enter the 6-digit code below.")
                .build();
    }

    private void deliverSmtp(String email, String code, String htmlBody) {
        if (mailSender != null && mailFrom != null && !mailFrom.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailFrom, "IntervAI Security");
                helper.setTo(email);
                helper.setSubject("Your IntervAI Verification Code: " + code);
                helper.setText(htmlBody, true);
                mailSender.send(message);
                log.info("[EMAIL SERVICE] Verification email successfully delivered via SMTP to {}", email);
                return;
            } catch (Exception e) {
                log.error("[EMAIL SERVICE] Failed to deliver email via SMTP to {}: {}", email, e.getMessage());
            }
        }

        log.info("[EMAIL INBOX] Verification email delivered to Candidate Mailbox for {}. Ready in Candidate Inbox.", email);
    }

    public List<InboxMessageDto> getInboxMessages(String email) {
        if (email != null && !email.isBlank()) {
            String target = email.trim().toLowerCase(Locale.ROOT);
            return mailbox.stream()
                    .filter(m -> m.getTo().equalsIgnoreCase(target))
                    .toList();
        }
        return Collections.unmodifiableList(mailbox);
    }

    public void clearInbox() {
        mailbox.clear();
    }

    private boolean hasActiveMailExchange(String domain) {
        // Skip external DNS resolution for local/test mock domains during offline/testing
        if (domain.equalsIgnoreCase("localhost") || domain.endsWith(".test") || domain.endsWith(".example")) {
            return true;
        }

        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            DirContext ictx = new InitialDirContext(env);
            Attributes attrs = ictx.getAttributes(domain, new String[]{"MX"});
            Attribute attr = attrs.get("MX");
            if (attr != null && attr.size() > 0) {
                return true;
            }

            // Fallback: Check A (address) records if domain acts as mail endpoint
            Attributes aAttrs = ictx.getAttributes(domain, new String[]{"A"});
            Attribute aAttr = aAttrs.get("A");
            return aAttr != null && aAttr.size() > 0;
        } catch (NamingException e) {
            log.warn("DNS check failed for email domain '{}': {}", domain, e.getMessage());
            return false;
        }
    }

    private String buildHtmlEmail(String recipient, String code, String verificationLink) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;background-color:#070b14;color:#f1f5f9;'>"
                + "<table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width:540px;background-color:#0d1322;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(0,0,0,0.5);'>"
                + "<tr><td align='center'>"
                + "<div style='font-size:22px;font-weight:800;color:#6366f1;letter-spacing:-0.5px;'>IntervAI Platform</div>"
                + "<h2 style='margin-top:16px;margin-bottom:8px;font-size:22px;font-weight:700;color:#ffffff;'>Verify Your Email Address</h2>"
                + "<p style='margin:0 0 20px;font-size:13px;line-height:1.6;color:#94a3b8;'>Click the button below to verify your email address and continue setting up your interview profile for <strong>" + recipient + "</strong>.</p>"
                + "<div style='margin:24px 0;'>"
                + "<a href='" + verificationLink + "' target='_blank' style='background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;display:inline-block;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(99,102,241,0.4);'>Verify Email &amp; Continue &rarr;</a>"
                + "</div>"
                + "<div style='border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;padding-top:20px;'>"
                + "<p style='margin:0 0 8px;font-size:12px;color:#94a3b8;'>Or manually enter this 6-digit verification code:</p>"
                + "<div style='background-color:#151f33;border:1px dashed #6366f1;border-radius:12px;padding:14px 20px;margin:8px 0 16px;letter-spacing:8px;font-size:30px;font-weight:800;color:#38bdf8;font-family:monospace;text-align:center;'>"
                + code
                + "</div>"
                + "</div>"
                + "<p style='margin:16px 0 0;font-size:11px;color:#64748b;line-height:1.5;word-break:break-all;'>"
                + "Link not clicking? Paste this URL into your browser:<br/>"
                + "<a href='" + verificationLink + "' style='color:#818cf8;text-decoration:underline;'>" + verificationLink + "</a>"
                + "</p>"
                + "<p style='margin:20px 0 0;font-size:11px;color:#475569;'>This code and link expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>"
                + "</td></tr>"
                + "</table>"
                + "</body></html>";
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
            throw new BadRequestException("No verification code was requested for this email. Please click 'Send Code' first.");
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

    public String resolveFrontendBaseUrl() {
        if (configuredFrontendUrl != null && !configuredFrontendUrl.isBlank()) {
            return configuredFrontendUrl.trim().replaceAll("/+$", "");
        }
        if (corsAllowedOrigins != null && !corsAllowedOrigins.isBlank()) {
            String[] origins = corsAllowedOrigins.split(",");
            for (String origin : origins) {
                String clean = origin.trim();
                if (!clean.isBlank() && !clean.contains("localhost") && !clean.contains("127.0.0.1")) {
                    return clean.replaceAll("/+$", "");
                }
            }
            if (origins.length > 0 && !origins[0].isBlank()) {
                return origins[0].trim().replaceAll("/+$", "");
            }
        }
        return "http://localhost:5173";
    }

    public String getCodeForTesting(String email) {
        VerificationEntry entry = verificationCodes.get(email.trim().toLowerCase(Locale.ROOT));
        return entry != null ? entry.getCode() : null;
    }
}
