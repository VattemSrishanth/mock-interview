package com.intervai.service;

import com.intervai.dto.WalletSummaryDto;
import com.intervai.entity.User;
import com.intervai.entity.UserCreditWallet;
import com.intervai.exception.InsufficientCreditsException;
import com.intervai.exception.ResourceNotFoundException;
import com.intervai.repository.UserCreditWalletRepository;
import com.intervai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditWalletService {

    private final UserCreditWalletRepository walletRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @org.springframework.beans.factory.annotation.Value("${app.billing.enforce-credits:true}")
    private boolean enforceCredits = true;

    /**
     * Retrieves or lazily creates a persistent credit wallet for a user.
     * New candidate wallets are seeded with 1 free technical interview and a unique referral code.
     */
    @Transactional
    public UserCreditWallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    return createWalletForUser(user);
                });
    }

    /**
     * Returns a summary of candidate interview credits and quota status.
     */
    @Transactional
    public WalletSummaryDto getWalletSummary(Long userId) {
        UserCreditWallet wallet = getOrCreateWallet(userId);
        int totalAvailable = wallet.getTotalAvailableInterviews();

        return WalletSummaryDto.builder()
                .creditsBalance(wallet.getCreditsBalance() != null ? wallet.getCreditsBalance() : 0)
                .freeInterviewsRemaining(wallet.getFreeInterviewsRemaining() != null ? wallet.getFreeInterviewsRemaining() : 0)
                .totalAvailableInterviews(totalAvailable)
                .referralCode(wallet.getReferralCode())
                .referredByCode(wallet.getReferredByCode())
                .totalInterviewsCompleted(wallet.getTotalInterviewsCompleted() != null ? wallet.getTotalInterviewsCompleted() : 0)
                .canStartInterview(totalAvailable > 0)
                .referralBonusEarnedCredits(0) // dynamic referral aggregation
                .build();
    }

    /**
     * Checks if a candidate has remaining interview quota (free or paid credits).
     */
    @Transactional(readOnly = true)
    public boolean hasSufficientQuota(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(w -> w.getTotalAvailableInterviews() > 0)
                .orElse(true); // If wallet not yet persisted, new users have 1 free credit by default
    }

    /**
     * Consumes one interview quota before generation begins.
     * Priority: Uses free interview first, then paid credits.
     */
    @Transactional
    public WalletSummaryDto consumeInterviewQuota(Long userId) {
        UserCreditWallet wallet = getOrCreateWallet(userId);

        if (wallet.getFreeInterviewsRemaining() != null && wallet.getFreeInterviewsRemaining() > 0) {
            wallet.setFreeInterviewsRemaining(wallet.getFreeInterviewsRemaining() - 1);
            wallet.setTotalInterviewsCompleted((wallet.getTotalInterviewsCompleted() != null ? wallet.getTotalInterviewsCompleted() : 0) + 1);
            log.info("Consumed 1 free interview for user {}. Remaining free: {}", userId, wallet.getFreeInterviewsRemaining());
        } else if (wallet.getCreditsBalance() != null && wallet.getCreditsBalance() > 0) {
            wallet.setCreditsBalance(wallet.getCreditsBalance() - 1);
            wallet.setTotalInterviewsCompleted((wallet.getTotalInterviewsCompleted() != null ? wallet.getTotalInterviewsCompleted() : 0) + 1);
            log.info("Consumed 1 paid credit for user {}. Remaining balance: {}", userId, wallet.getCreditsBalance());
        } else if (enforceCredits) {
            throw new InsufficientCreditsException(
                    "You have 0 mock interview credits remaining. Please recharge via UPI to continue practicing."
            );
        } else {
            log.warn("Credit enforcement bypassed for user {} (enforceCredits=false)", userId);
        }

        walletRepository.save(wallet);
        return getWalletSummary(userId);
    }

    /**
     * Credits a specified number of interview credits to a user's wallet.
     */
    @Transactional
    public WalletSummaryDto addCredits(Long userId, int credits, String reason) {
        if (credits <= 0) {
            throw new IllegalArgumentException("Credits to add must be greater than zero");
        }
        UserCreditWallet wallet = getOrCreateWallet(userId);
        int current = wallet.getCreditsBalance() != null ? wallet.getCreditsBalance() : 0;
        wallet.setCreditsBalance(current + credits);
        walletRepository.save(wallet);

        log.info("Added {} credits to user {} (Reason: {}). New balance: {}", credits, userId, reason, wallet.getCreditsBalance());
        return getWalletSummary(userId);
    }

    /**
     * Creates an initial wallet with 1 free interview and unique referral code.
     */
    private UserCreditWallet createWalletForUser(User user) {
        String code = generateUniqueReferralCode(user.getName());
        UserCreditWallet wallet = UserCreditWallet.builder()
                .user(user)
                .creditsBalance(0)
                .freeInterviewsRemaining(1)
                .referralCode(code)
                .totalInterviewsCompleted(0)
                .build();
        return walletRepository.save(wallet);
    }

    /**
     * Generates a human-friendly unique referral code (e.g., ALEX-8392).
     */
    private String generateUniqueReferralCode(String name) {
        String cleanName = "CAMPUS";
        if (name != null) {
            String alphaOnly = name.replaceAll("[^a-zA-Z]", "").toUpperCase(Locale.ROOT);
            if (!alphaOnly.isEmpty()) {
                cleanName = alphaOnly.length() > 5 ? alphaOnly.substring(0, 5) : alphaOnly;
            }
        }

        for (int attempts = 0; attempts < 20; attempts++) {
            int randomDigits = 1000 + secureRandom.nextInt(9000);
            String candidateCode = cleanName + "-" + randomDigits;
            if (!walletRepository.existsByReferralCode(candidateCode)) {
                return candidateCode;
            }
        }

        return "INTERV-" + (10000 + secureRandom.nextInt(90000));
    }
}
