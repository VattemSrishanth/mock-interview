package com.intervai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions", indexes = {
    @Index(name = "idx_payment_order_id", columnList = "orderId", unique = true),
    @Index(name = "idx_payment_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 64)
    private String orderId;

    @Column(length = 64)
    private String paymentId;

    @Column(nullable = false)
    private Long amountPaise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PricingPlanTier planTier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(length = 64)
    private String upiId;

    @Column(length = 256)
    private String paymentSignature;

    @Column(nullable = false)
    private Integer creditsGranted;

    @Column(length = 32)
    private String appliedReferralCode;

    @Column
    private Long discountAmountPaise;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
