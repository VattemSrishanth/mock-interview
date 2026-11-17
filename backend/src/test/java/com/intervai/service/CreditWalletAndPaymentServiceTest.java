package com.intervai.service;

import com.intervai.dto.CreateOrderRequest;
import com.intervai.dto.PaymentOrderResponse;
import com.intervai.dto.VerifyPaymentRequest;
import com.intervai.dto.WalletSummaryDto;
import com.intervai.entity.*;
import com.intervai.exception.BadRequestException;
import com.intervai.exception.InsufficientCreditsException;
import com.intervai.repository.PaymentTransactionRepository;
import com.intervai.repository.UserCreditWalletRepository;
import com.intervai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditWalletAndPaymentServiceTest {

    @Mock
    private UserCreditWalletRepository walletRepository;

    @Mock
    private PaymentTransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    private CreditWalletService creditWalletService;
    private PaymentService paymentService;

    private User buyer;
    private User referrer;

    @BeforeEach
    void setUp() {
        creditWalletService = new CreditWalletService(walletRepository, userRepository);
        ReflectionTestUtils.setField(creditWalletService, "enforceCredits", true);

        paymentService = new PaymentService(transactionRepository, walletRepository, userRepository, creditWalletService);
        ReflectionTestUtils.setField(paymentService, "upiVpa", "intervai@upi");
        ReflectionTestUtils.setField(paymentService, "upiPayeeName", "IntervAI");
        ReflectionTestUtils.setField(paymentService, "paymentSecretKey", "test_hmac_secret_2026");

        buyer = User.builder().id(10L).name("Srishanth").email("srishanth@example.com").build();
        referrer = User.builder().id(20L).name("Rahul").email("rahul@example.com").build();
    }

    @Test
    void consumeQuotaUsesFreeInterviewFirstThenPaidCreditsThenThrows() {
        UserCreditWallet wallet = UserCreditWallet.builder()
                .id(1L)
                .user(buyer)
                .freeInterviewsRemaining(1)
                .creditsBalance(1)
                .referralCode("SRISH-1001")
                .totalInterviewsCompleted(0)
                .build();

        when(walletRepository.findByUserId(10L)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any(UserCreditWallet.class))).thenAnswer(inv -> inv.getArgument(0));

        // 1st consumption: consumes free trial
        WalletSummaryDto afterFirst = creditWalletService.consumeInterviewQuota(10L);
        assertEquals(0, afterFirst.getFreeInterviewsRemaining());
        assertEquals(1, afterFirst.getCreditsBalance());
        assertEquals(1, afterFirst.getTotalAvailableInterviews());
        assertTrue(afterFirst.isCanStartInterview());

        // 2nd consumption: consumes paid credit
        WalletSummaryDto afterSecond = creditWalletService.consumeInterviewQuota(10L);
        assertEquals(0, afterSecond.getFreeInterviewsRemaining());
        assertEquals(0, afterSecond.getCreditsBalance());
        assertEquals(0, afterSecond.getTotalAvailableInterviews());
        assertFalse(afterSecond.isCanStartInterview());

        // 3rd consumption: throws InsufficientCreditsException
        assertThrows(InsufficientCreditsException.class, () -> creditWalletService.consumeInterviewQuota(10L));
    }

    @Test
    void createUpiOrderAppliesCampusReferralDiscountAndBuildsValidDeepLink() {
        UserCreditWallet buyerWallet = UserCreditWallet.builder()
                .id(1L).user(buyer).referralCode("SRISH-1001").creditsBalance(0).freeInterviewsRemaining(0).build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(buyer));
        when(walletRepository.findByUserId(10L)).thenReturn(Optional.of(buyerWallet));
        when(walletRepository.existsByReferralCode("RAHUL-9999")).thenReturn(true);
        when(transactionRepository.save(any(PaymentTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateOrderRequest req = CreateOrderRequest.builder()
                .planTier(PricingPlanTier.STARTER_PACK_149)
                .referralCode("rahul-9999")
                .build();

        PaymentOrderResponse res = paymentService.createUpiOrder(10L, req);

        assertNotNull(res.getOrderId());
        assertTrue(res.getOrderId().startsWith("ORDER_UPI_"));
        assertEquals(14900L, res.getAmountPaise());
        assertEquals(2000L, res.getDiscountAmountPaise()); // ₹20 discount
        assertEquals(12900L, res.getFinalAmountPaise());    // ₹129 final
        assertEquals(5, res.getCreditsToGrant());
        assertEquals("RAHUL-9999", res.getAppliedReferralCode());
        assertTrue(res.getUpiDeepLink().startsWith("upi://pay?pa=intervai@upi&pn=IntervAI&am=129.00&cu=INR"));
    }

    @Test
    void createUpiOrderIgnoresSelfReferralCode() {
        UserCreditWallet buyerWallet = UserCreditWallet.builder()
                .id(1L).user(buyer).referralCode("SRISH-1001").creditsBalance(0).freeInterviewsRemaining(0).build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(buyer));
        when(walletRepository.findByUserId(10L)).thenReturn(Optional.of(buyerWallet));
        when(transactionRepository.save(any(PaymentTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateOrderRequest req = CreateOrderRequest.builder()
                .planTier(PricingPlanTier.STARTER_PACK_149)
                .referralCode("SRISH-1001")
                .build();

        PaymentOrderResponse res = paymentService.createUpiOrder(10L, req);

        assertEquals(0L, res.getDiscountAmountPaise());
        assertEquals(14900L, res.getFinalAmountPaise());
        assertNull(res.getAppliedReferralCode());
    }

    @Test
    void verifyPaymentCreditsBuyerAndRewardsReferrerAndRejectsForgedSignature() {
        UserCreditWallet buyerWallet = UserCreditWallet.builder()
                .id(1L).user(buyer).referralCode("SRISH-1001").creditsBalance(0).freeInterviewsRemaining(0).build();
        UserCreditWallet referrerWallet = UserCreditWallet.builder()
                .id(2L).user(referrer).referralCode("RAHUL-9999").creditsBalance(2).freeInterviewsRemaining(0).build();

        PaymentTransaction pendingTx = PaymentTransaction.builder()
                .id(100L)
                .orderId("ORDER_UPI_TEST_01")
                .user(buyer)
                .amountPaise(14900L)
                .discountAmountPaise(2000L)
                .appliedReferralCode("RAHUL-9999")
                .planTier(PricingPlanTier.STARTER_PACK_149)
                .creditsGranted(5)
                .status(PaymentStatus.PENDING)
                .build();

        when(transactionRepository.findByOrderId("ORDER_UPI_TEST_01")).thenReturn(Optional.of(pendingTx));
        when(transactionRepository.save(any(PaymentTransaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(walletRepository.findByUserId(10L)).thenReturn(Optional.of(buyerWallet));
        when(walletRepository.findByUserId(20L)).thenReturn(Optional.of(referrerWallet));
        when(walletRepository.findByReferralCode("RAHUL-9999")).thenReturn(Optional.of(referrerWallet));
        when(walletRepository.save(any(UserCreditWallet.class))).thenAnswer(inv -> inv.getArgument(0));

        // 1. Test forged signature rejection
        VerifyPaymentRequest forgedReq = VerifyPaymentRequest.builder()
                .orderId("ORDER_UPI_TEST_01")
                .paymentId("UTR_987654321")
                .signature("forged_invalid_hex_signature")
                .build();
        assertThrows(BadRequestException.class, () -> paymentService.verifyPayment(10L, forgedReq));
        assertEquals(PaymentStatus.FAILED, pendingTx.getStatus());

        // Reset to PENDING and verify valid HMAC signature
        pendingTx.setStatus(PaymentStatus.PENDING);
        String validSignature = paymentService.computeHmacSha256("ORDER_UPI_TEST_01|UTR_987654321", "test_hmac_secret_2026");

        VerifyPaymentRequest validReq = VerifyPaymentRequest.builder()
                .orderId("ORDER_UPI_TEST_01")
                .paymentId("UTR_987654321")
                .signature(validSignature)
                .upiId("srishanth@okaxis")
                .build();

        WalletSummaryDto result = paymentService.verifyPayment(10L, validReq);

        assertEquals(PaymentStatus.SUCCESS, pendingTx.getStatus());
        assertEquals(5, result.getCreditsBalance());           // Buyer credited +5
        assertEquals(3, referrerWallet.getCreditsBalance());   // Referrer rewarded +1 (2 -> 3)
    }
}
