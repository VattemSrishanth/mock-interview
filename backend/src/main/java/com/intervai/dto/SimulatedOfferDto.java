package com.intervai.dto;

import com.intervai.entity.PlacementCompanyTier;
import java.time.LocalDate;
import java.util.List;

public class SimulatedOfferDto {
    private String offerId;
    private String candidateName;
    private String companyName;
    private PlacementCompanyTier companyTier;
    private String designation;
    private String workLocation;
    private long baseSalaryPaise;
    private long variableBonusPaise;
    private long joiningBonusPaise;
    private long rsuStockGrantPaise;
    private long totalCompensationPaise;
    private String formattedTotalCtc;
    private double percentileScore;
    private LocalDate tentativeJoiningDate;
    private LocalDate offerExpiryDate;
    private List<String> benefitsAndPerks;
    private String digitalVerificationHash;

    public SimulatedOfferDto() {}

    public String getOfferId() { return offerId; }
    public void setOfferId(String offerId) { this.offerId = offerId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public PlacementCompanyTier getCompanyTier() { return companyTier; }
    public void setCompanyTier(PlacementCompanyTier companyTier) { this.companyTier = companyTier; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getWorkLocation() { return workLocation; }
    public void setWorkLocation(String workLocation) { this.workLocation = workLocation; }

    public long getBaseSalaryPaise() { return baseSalaryPaise; }
    public void setBaseSalaryPaise(long baseSalaryPaise) { this.baseSalaryPaise = baseSalaryPaise; }

    public long getVariableBonusPaise() { return variableBonusPaise; }
    public void setVariableBonusPaise(long variableBonusPaise) { this.variableBonusPaise = variableBonusPaise; }

    public long getJoiningBonusPaise() { return joiningBonusPaise; }
    public void setJoiningBonusPaise(long joiningBonusPaise) { this.joiningBonusPaise = joiningBonusPaise; }

    public long getRsuStockGrantPaise() { return rsuStockGrantPaise; }
    public void setRsuStockGrantPaise(long rsuStockGrantPaise) { this.rsuStockGrantPaise = rsuStockGrantPaise; }

    public long getTotalCompensationPaise() { return totalCompensationPaise; }
    public void setTotalCompensationPaise(long totalCompensationPaise) { this.totalCompensationPaise = totalCompensationPaise; }

    public String getFormattedTotalCtc() { return formattedTotalCtc; }
    public void setFormattedTotalCtc(String formattedTotalCtc) { this.formattedTotalCtc = formattedTotalCtc; }

    public double getPercentileScore() { return percentileScore; }
    public void setPercentileScore(double percentileScore) { this.percentileScore = percentileScore; }

    public LocalDate getTentativeJoiningDate() { return tentativeJoiningDate; }
    public void setTentativeJoiningDate(LocalDate tentativeJoiningDate) { this.tentativeJoiningDate = tentativeJoiningDate; }

    public LocalDate getOfferExpiryDate() { return offerExpiryDate; }
    public void setOfferExpiryDate(LocalDate offerExpiryDate) { this.offerExpiryDate = offerExpiryDate; }

    public List<String> getBenefitsAndPerks() { return benefitsAndPerks; }
    public void setBenefitsAndPerks(List<String> benefitsAndPerks) { this.benefitsAndPerks = benefitsAndPerks; }

    public String getDigitalVerificationHash() { return digitalVerificationHash; }
    public void setDigitalVerificationHash(String digitalVerificationHash) { this.digitalVerificationHash = digitalVerificationHash; }
}
