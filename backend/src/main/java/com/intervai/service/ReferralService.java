package com.intervai.service;

import com.intervai.dto.ReferralStatsDto;
import com.intervai.dto.ReferralValidationDto;
import com.intervai.dto.ValidateReferralRequest;
import com.intervai.entity.PaymentStatus;
import com.intervai.entity.PricingPlanTier;
import com.intervai.entity.UserCreditWallet;
import com.intervai.repository.PaymentTransactionRepository;
import com.intervai.repository.UserCreditWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {

    private final UserCreditWalletRepository walletRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final CreditWalletService creditWalletService;

    @Value("${app.frontend.url:https://mock-interview.onrender.com}")
    private String frontendUrl;

    /**
     * Validates a campus referral code and computes instant pricing discounts.
     */
    @Transactional(readOnly = true)
    public ReferralValidationDto validateReferralCode(Long currentUserId, ValidateReferralRequest request) {
        if (request.getReferralCode() == null || request.getReferralCode().trim().isEmpty()) {
            return ReferralValidationDto.builder()
                    .valid(false)
                    .discountPaise(0L)
                    .discountRupees(0)
                    .message("Please enter a referral code")
                    .build();
        }

        String code = request.getReferralCode().trim().toUpperCase(Locale.ROOT);
        UserCreditWallet ownWallet = currentUserId != null ? creditWalletService.getOrCreateWallet(currentUserId) : null;

        if (ownWallet != null && code.equalsIgnoreCase(ownWallet.getReferralCode())) {
            return ReferralValidationDto.builder()
                    .referralCode(code)
                    .valid(false)
                    .discountPaise(0L)
                    .discountRupees(0)
                    .message("You cannot use your own referral code")
                    .build();
        }

        Optional<UserCreditWallet> referrerOpt = walletRepository.findByReferralCode(code);
        if (referrerOpt.isEmpty()) {
            return ReferralValidationDto.builder()
                    .referralCode(code)
                    .valid(false)
                    .discountPaise(0L)
                    .discountRupees(0)
                    .message("Invalid or expired referral code")
                    .build();
        }

        UserCreditWallet referrer = referrerOpt.get();
        String referrerName = maskName(referrer.getUser().getName());

        long discountPaise = 2000L; // default ₹20 discount
        PricingPlanTier tier = request.getPlanTier();
        if (tier == PricingPlanTier.SINGLE_MOCK_49) {
            discountPaise = 1000L; // ₹10
        } else if (tier == PricingPlanTier.UNLIMITED_PASS_299) {
            discountPaise = 5000L; // ₹50
        }

        int discountRupees = (int) (discountPaise / 100);

        return ReferralValidationDto.builder()
                .referralCode(code)
                .valid(true)
                .referrerName(referrerName)
                .discountPaise(discountPaise)
                .discountRupees(discountRupees)
                .message("Valid code! " + referrerName + "'s campus invite applies ₹" + discountRupees + " instant discount.")
                .build();
    }

    /**
     * Aggregates referral program analytics and lifetime credits earned for candidate.
     */
    @Transactional(readOnly = true)
    public ReferralStatsDto getReferralStats(Long userId) {
        UserCreditWallet wallet = creditWalletService.getOrCreateWallet(userId);
        String code = wallet.getReferralCode();

        long friendsInvited = walletRepository.countByReferredByCode(code);
        long successfulConversions = transactionRepository.countByAppliedReferralCodeAndStatus(code, PaymentStatus.SUCCESS);
        long bonusCredits = successfulConversions; // 1 credit awarded per successful conversion

        String cleanUrl = frontendUrl != null ? frontendUrl.replaceAll("/$", "") : "https://mock-interview.onrender.com";
        String shareUrl = cleanUrl + "/register?ref=" + code;

        return ReferralStatsDto.builder()
                .referralCode(code)
                .shareUrl(shareUrl)
                .friendsInvitedCount(friendsInvited)
                .successfulConversionsCount(successfulConversions)
                .bonusCreditsEarned(bonusCredits)
                .discountPerFriendRupees(20)
                .rewardPerConversionCredits(1)
                .build();
    }

    private String maskName(String rawName) {
        if (rawName == null || rawName.trim().isEmpty()) {
            return "Campus Peer";
        }
        String trimmed = rawName.trim();
        if (trimmed.length() <= 3) {
            return trimmed.charAt(0) + "***";
        }
        return trimmed.charAt(0) + "***" + trimmed.substring(trimmed.length() - 1);
    }
}
