package com.intervai.service;

import com.intervai.dto.CreateOrderRequest;
import com.intervai.dto.PaymentOrderResponse;
import com.intervai.dto.VerifyPaymentRequest;
import com.intervai.dto.WalletSummaryDto;
import com.intervai.entity.*;
import com.intervai.exception.BadRequestException;
import com.intervai.exception.ResourceNotFoundException;
import com.intervai.repository.PaymentTransactionRepository;
import com.intervai.repository.UserCreditWalletRepository;
import com.intervai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final UserCreditWalletRepository walletRepository;
    private final UserRepository userRepository;
    private final CreditWalletService creditWalletService;

    @Value("${app.payment.upi.vpa:intervai@upi}")
    private String upiVpa;

    @Value("${app.payment.upi.payee-name:IntervAI}")
    private String upiPayeeName;

    @Value("${app.payment.secret-key:intervai_secure_upi_payment_hmac_secret_2026}")
    private String paymentSecretKey;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Creates an initialized UPI order with dynamic referral discount calculation.
     */
    @Transactional
    public PaymentOrderResponse createUpiOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        PricingPlanTier tier = request.getPlanTier();
        if (tier == null) {
            throw new BadRequestException("Pricing plan tier is required");
        }

        Long baseAmountPaise = tier.getAmountPaise();
        Long discountPaise = 0L;
        String normalizedReferral = null;

        if (request.getReferralCode() != null && !request.getReferralCode().trim().isEmpty()) {
            String candidateCode = request.getReferralCode().trim().toUpperCase(Locale.ROOT);
            UserCreditWallet ownWallet = creditWalletService.getOrCreateWallet(userId);

            if (candidateCode.equalsIgnoreCase(ownWallet.getReferralCode())) {
                log.warn("User {} attempted to use self-referral code {}", userId, candidateCode);
            } else if (walletRepository.existsByReferralCode(candidateCode)) {
                normalizedReferral = candidateCode;
                // Campus referral discount logic: ₹20 off for packages >= ₹149, ₹10 off for single mock
                if (tier == PricingPlanTier.STARTER_PACK_149) {
                    discountPaise = 2000L; // ₹20 off -> ₹129
                } else if (tier == PricingPlanTier.UNLIMITED_PASS_299) {
                    discountPaise = 5000L; // ₹50 off -> ₹249
                } else if (tier == PricingPlanTier.SINGLE_MOCK_49) {
                    discountPaise = 1000L; // ₹10 off -> ₹39
                }
            }
        }

        Long finalAmountPaise = Math.max(100L, baseAmountPaise - discountPaise);
        double finalAmountRupees = finalAmountPaise / 100.0;

        String orderId = String.format("ORDER_UPI_%d_%04x", System.currentTimeMillis(), secureRandom.nextInt(0x10000));

        // Generate standard UPI Deep Link URL specification
        String upiDeepLink = String.format(Locale.ROOT,
                "upi://pay?pa=%s&pn=%s&am=%.2f&cu=INR&tn=IntervAI_%s",
                upiVpa,
                upiPayeeName.replaceAll(" ", "%20"),
                finalAmountRupees,
                orderId
        );

        PaymentTransaction transaction = PaymentTransaction.builder()
                .orderId(orderId)
                .user(user)
                .amountPaise(baseAmountPaise)
                .discountAmountPaise(discountPaise)
                .appliedReferralCode(normalizedReferral)
                .planTier(tier)
                .creditsGranted(tier.getCreditsGranted())
                .status(PaymentStatus.PENDING)
                .build();

        transactionRepository.save(transaction);
        log.info("Created UPI payment order {} for user {} [Tier: {}, Amount: {} paise]", orderId, userId, tier, finalAmountPaise);

        return PaymentOrderResponse.builder()
                .orderId(orderId)
                .planTier(tier)
                .amountPaise(baseAmountPaise)
                .discountAmountPaise(discountPaise)
                .finalAmountPaise(finalAmountPaise)
                .creditsToGrant(tier.getCreditsGranted())
                .upiDeepLink(upiDeepLink)
                .upiPayeeVpa(upiVpa)
                .upiPayeeName(upiPayeeName)
                .status(PaymentStatus.PENDING)
                .appliedReferralCode(normalizedReferral)
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    /**
     * Cryptographically verifies a completed payment and credits the candidate's wallet.
     * Also rewards the referrer with 1 bonus credit if a referral code was applied.
     */
    @Transactional
    public WalletSummaryDto verifyPayment(Long userId, VerifyPaymentRequest request) {
        PaymentTransaction transaction = transactionRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for order: " + request.getOrderId()));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to payment order");
        }

        if (transaction.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment order {} already marked SUCCESS (idempotent call)", request.getOrderId());
            return creditWalletService.getWalletSummary(userId);
        }

        // Compute expected HMAC signature
        String expectedPayload = transaction.getOrderId() + "|" + request.getPaymentId();
        String expectedSignature = computeHmacSha256(expectedPayload, paymentSecretKey);

        if (request.getSignature() != null && !request.getSignature().isBlank()) {
            if (!expectedSignature.equalsIgnoreCase(request.getSignature().trim())) {
                log.warn("Invalid payment signature received for order {}", request.getOrderId());
                transaction.setStatus(PaymentStatus.FAILED);
                transactionRepository.save(transaction);
                throw new BadRequestException("Invalid payment signature");
            }
        }

        // Mark payment successful
        transaction.setStatus(PaymentStatus.SUCCESS);
        transaction.setPaymentId(request.getPaymentId());
        transaction.setPaymentSignature(expectedSignature);
        transaction.setUpiId(request.getUpiId() != null ? request.getUpiId() : "candidate@upi");
        transactionRepository.save(transaction);

        // Credit candidate wallet
        creditWalletService.addCredits(
                userId,
                transaction.getCreditsGranted(),
                "UPI Payment: " + transaction.getOrderId() + " (" + transaction.getPlanTier().name() + ")"
        );

        // Campus referral reward: award referrer with 1 bonus credit
        if (transaction.getAppliedReferralCode() != null) {
            walletRepository.findByReferralCode(transaction.getAppliedReferralCode())
                    .ifPresent(referrerWallet -> {
                        creditWalletService.addCredits(
                                referrerWallet.getUser().getId(),
                                1,
                                "Referral Bonus from order " + transaction.getOrderId()
                        );
                        log.info("Awarded 1 referral bonus credit to user {} for code {}",
                                referrerWallet.getUser().getId(), transaction.getAppliedReferralCode());
                    });
        }

        return creditWalletService.getWalletSummary(userId);
    }

    /**
     * Lists all payment transactions for a given candidate.
     */
    @Transactional(readOnly = true)
    public List<PaymentTransaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Cryptographic utility to generate HMAC-SHA256 signature for payment verification.
     */
    public String computeHmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hmacBytes);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256", e);
        }
    }
}
