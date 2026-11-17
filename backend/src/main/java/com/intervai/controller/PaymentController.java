package com.intervai.controller;

import com.intervai.dto.*;
import com.intervai.entity.PaymentTransaction;
import com.intervai.entity.PricingPlanTier;
import com.intervai.exception.UnauthorizedException;
import com.intervai.security.UserPrincipal;
import com.intervai.service.CreditWalletService;
import com.intervai.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class PaymentController {

    private final CreditWalletService creditWalletService;
    private final PaymentService paymentService;
    private final com.intervai.service.ReferralService referralService;

    /**
     * Validates campus referral code and computes instant discount deduction.
     */
    @PostMapping("/referral/validate")
    public ResponseEntity<ReferralValidationDto> validateReferral(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ValidateReferralRequest request) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(referralService.validateReferralCode(userId, request));
    }

    /**
     * Retrieves referral performance statistics and personal invite link.
     */
    @GetMapping("/referral/stats")
    public ResponseEntity<ReferralStatsDto> getReferralStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        return ResponseEntity.ok(referralService.getReferralStats(userPrincipal.getId()));
    }

    /**
     * Returns real-time interview credit balance, remaining free trials, and referral codes.
     */
    @GetMapping("/wallet")
    public ResponseEntity<WalletSummaryDto> getWalletBalance(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new UnauthorizedException("Authentication is required to view wallet");
        }
        return ResponseEntity.ok(creditWalletService.getWalletSummary(userPrincipal.getId()));
    }

    /**
     * Public catalog of student-friendly micro-pricing tiers.
     */
    @GetMapping("/plans")
    public ResponseEntity<List<PricingPlanDto>> getPricingPlans() {
        List<PricingPlanDto> plans = List.of(
                PricingPlanDto.builder()
                        .id(PricingPlanTier.SINGLE_MOCK_49)
                        .name("Single Mock Interview")
                        .tag("Single Ticket")
                        .amountPaise(PricingPlanTier.SINGLE_MOCK_49.getAmountPaise())
                        .amountRupees((int) (PricingPlanTier.SINGLE_MOCK_49.getAmountPaise() / 100))
                        .credits(1)
                        .description("Perfect for a quick dress rehearsal before tomorrow's technical round.")
                        .features(List.of(
                                "1 Full AI Technical Mock Interview",
                                "Comprehensive PDF Executive Dossier",
                                "5-Axis Competency Radar Chart",
                                "Cryptographic Verification Badge"
                        ))
                        .isPopular(false)
                        .build(),
                PricingPlanDto.builder()
                        .id(PricingPlanTier.STARTER_PACK_149)
                        .name("Placement Starter Pack")
                        .tag("Most Popular")
                        .amountPaise(PricingPlanTier.STARTER_PACK_149.getAmountPaise())
                        .amountRupees((int) (PricingPlanTier.STARTER_PACK_149.getAmountPaise() / 100))
                        .credits(5)
                        .description("Comprehensive multi-round preparation covering DSA, System Design & Behavioral.")
                        .features(List.of(
                                "5 AI Technical & Behavioral Mock Sessions",
                                "Side-by-side Model vs Answer Breakdown",
                                "Live Code Execution Sandbox (4 Languages)",
                                "Peer Percentile Benchmarking & Rank",
                                "WhatsApp & LinkedIn 1-Click Viral Sharing"
                        ))
                        .isPopular(true)
                        .build(),
                PricingPlanDto.builder()
                        .id(PricingPlanTier.UNLIMITED_PASS_299)
                        .name("30-Day Campus Mastery Pass")
                        .tag("Best Value")
                        .amountPaise(PricingPlanTier.UNLIMITED_PASS_299.getAmountPaise())
                        .amountRupees((int) (PricingPlanTier.UNLIMITED_PASS_299.getAmountPaise() / 100))
                        .credits(30)
                        .description("Ultimate prep pass for high-intensity campus hiring seasons and off-campus drives.")
                        .features(List.of(
                                "30 AI Mock Interviews (Technical, System Design, HR)",
                                "Unlimited Monaco Code Sandbox Runs",
                                "Personalized Recruiter Hiring Recommendations",
                                "Dedicated Speech Cadence & Audio Playback Analysis",
                                "Priority Gemini / LLM Token Pipeline",
                                "Campus Referral Booster (+1 credit per friend)"
                        ))
                        .isPopular(false)
                        .build()
        );
        return ResponseEntity.ok(plans);
    }

    /**
     * Initializes a UPI micro-payment order with deep-link generation.
     */
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateOrderRequest request) {
        if (userPrincipal == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        PaymentOrderResponse response = paymentService.createUpiOrder(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Verifies cryptographic signature or mock transaction confirmation.
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<WalletSummaryDto> verifyPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody VerifyPaymentRequest request) {
        if (userPrincipal == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        WalletSummaryDto updatedWallet = paymentService.verifyPayment(userPrincipal.getId(), request);
        return ResponseEntity.ok(updatedWallet);
    }

    /**
     * Lists candidate's payment history and invoices.
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransaction>> getTransactionHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        return ResponseEntity.ok(paymentService.getUserTransactions(userPrincipal.getId()));
    }
}
