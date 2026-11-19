package com.intervai.service;

import com.intervai.dto.MultiRoundAssessmentDto;
import com.intervai.dto.SimulatedOfferDto;
import com.intervai.entity.PlacementCompanyTier;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class SimulatedOfferService {

    public SimulatedOfferDto generateOffer(MultiRoundAssessmentDto pipeline, String candidateName) {
        PlacementCompanyTier tier = pipeline.getCompanyTier() != null ? pipeline.getCompanyTier() : PlacementCompanyTier.TIER_2_UNIFIED;
        String name = candidateName != null && !candidateName.isBlank() ? candidateName : "Qualified Candidate";
        String company = pipeline.getCompanyName();
        double score = pipeline.getCumulativeScore();

        SimulatedOfferDto offer = new SimulatedOfferDto();
        offer.setOfferId("OFR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        offer.setCandidateName(name);
        offer.setCompanyName(company);
        offer.setCompanyTier(tier);
        offer.setPercentileScore(calculatePercentile(score));
        offer.setTentativeJoiningDate(LocalDate.now().plusMonths(2));
        offer.setOfferExpiryDate(LocalDate.now().plusDays(14));

        switch (tier) {
            case TIER_1_FAANG -> {
                offer.setDesignation("Software Development Engineer I (L3 / SDE-1)");
                offer.setWorkLocation("Bengaluru / Hyderabad, India (Hybrid)");
                offer.setBaseSalaryPaise(240000000L); // 24 LPA in paise
                offer.setVariableBonusPaise(36000000L); // 3.6 LPA
                offer.setJoiningBonusPaise(40000000L); // 4.0 LPA
                offer.setRsuStockGrantPaise(160000000L); // 16 LPA over 4 years (~4L/yr)
                offer.setTotalCompensationPaise(320000000L); // 32 LPA total 1st year
                offer.setFormattedTotalCtc("₹32,00,000 INR (32.0 LPA)");
                offer.setBenefitsAndPerks(List.of(
                        "Comprehensive Health & Term Insurance (₹20,00,000 coverage)",
                        "₹1,50,000 Annual Wellness & Home-Office Allowance",
                        "Free Gourmet On-Campus Meals & Daily Shuttles",
                        "Unlimited Access to Professional Certifications & Tech Conferences"
                ));
            }
            case TIER_2_UNIFIED -> {
                offer.setDesignation("Member of Technical Staff / Software Engineer");
                offer.setWorkLocation("Bengaluru / Pune, India (Hybrid)");
                offer.setBaseSalaryPaise(150000000L); // 15 LPA
                offer.setVariableBonusPaise(15000000L); // 1.5 LPA
                offer.setJoiningBonusPaise(15000000L); // 1.5 LPA
                offer.setRsuStockGrantPaise(40000000L); // 4 LPA ESOPs
                offer.setTotalCompensationPaise(180000000L); // 18 LPA
                offer.setFormattedTotalCtc("₹18,00,000 INR (18.0 LPA)");
                offer.setBenefitsAndPerks(List.of(
                        "Medical Insurance for Family (₹10,00,000 coverage)",
                        "Flexible Hybrid Work Policy (2 days in-office)",
                        "Annual Learning & Development Stipend of ₹50,000",
                        "ESOP Wealth-Creation Pool Vesting"
                ));
            }
            case TIER_3_ENTERPRISE_IT -> {
                offer.setDesignation("Digital Software Engineer / Specialist Programmer");
                offer.setWorkLocation("Hyderabad / Chennai, India");
                offer.setBaseSalaryPaise(70000000L); // 7 LPA
                offer.setVariableBonusPaise(10000000L); // 1 LPA
                offer.setJoiningBonusPaise(5000000L); // 0.5 LPA
                offer.setRsuStockGrantPaise(0L);
                offer.setTotalCompensationPaise(85000000L); // 8.5 LPA
                offer.setFormattedTotalCtc("₹8,50,000 INR (8.5 LPA)");
                offer.setBenefitsAndPerks(List.of(
                        "Group Health Insurance & Dependents Shield",
                        "Fast-Track Career Advancement & Higher Education Sponsorship",
                        "Global Project Rotational Mobility Program",
                        "Performance-Linked Retention Incentive"
                ));
            }
            default -> {
                offer.setDesignation("Graduate Software Trainee");
                offer.setWorkLocation("Hyderabad, India");
                offer.setBaseSalaryPaise(60000000L);
                offer.setVariableBonusPaise(5000000L);
                offer.setJoiningBonusPaise(0L);
                offer.setRsuStockGrantPaise(0L);
                offer.setTotalCompensationPaise(65000000L);
                offer.setFormattedTotalCtc("₹6,50,000 INR (6.5 LPA)");
                offer.setBenefitsAndPerks(List.of("Standard Corporate Health Insurance", "Learning Portal Access"));
            }
        }

        offer.setDigitalVerificationHash(computeVerificationHash(offer));
        return offer;
    }

    private double calculatePercentile(double score) {
        if (score >= 90) return 96.5;
        if (score >= 80) return 88.0;
        if (score >= 70) return 74.5;
        return 60.0;
    }

    private String computeVerificationHash(SimulatedOfferDto offer) {
        try {
            String raw = offer.getOfferId() + "|" + offer.getCandidateName() + "|" + offer.getCompanyName() + "|" + offer.getTotalCompensationPaise();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
