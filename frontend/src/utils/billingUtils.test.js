import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPaiseToRupees,
  calculateReferralDiscountPaise,
  computeFinalAmountPaise,
  isValidReferralCodeFormat,
  buildUpiDeepLink,
  computePerInterviewCostRupees,
  computeSavingsPercentage,
} from './billingUtils.js';

describe('billingUtils — UPI Micro-Transaction & Referral Math', () => {
  it('formats paise into crisp Indian Rupee currency strings', () => {
    assert.equal(formatPaiseToRupees(4900), '₹49');
    assert.equal(formatPaiseToRupees(14900), '₹149');
    assert.equal(formatPaiseToRupees(29900), '₹299');
    assert.equal(formatPaiseToRupees(0), '₹0');
    assert.equal(formatPaiseToRupees(-500), '₹0');
    assert.equal(formatPaiseToRupees(null), '₹0');
  });

  it('computes tier-specific campus referral discounts correctly', () => {
    assert.equal(calculateReferralDiscountPaise('SINGLE_MOCK_49', true), 1000);
    assert.equal(calculateReferralDiscountPaise('STARTER_PACK_149', true), 2000);
    assert.equal(calculateReferralDiscountPaise('UNLIMITED_PASS_299', true), 5000);
    assert.equal(calculateReferralDiscountPaise('STARTER_PACK_149', false), 0);
    assert.equal(calculateReferralDiscountPaise('UNKNOWN_TIER', true), 0);
  });

  it('computes final net payable paise with and without referral code', () => {
    assert.equal(computeFinalAmountPaise('SINGLE_MOCK_49', false), 4900);
    assert.equal(computeFinalAmountPaise('SINGLE_MOCK_49', true), 3900);
    assert.equal(computeFinalAmountPaise('STARTER_PACK_149', false), 14900);
    assert.equal(computeFinalAmountPaise('STARTER_PACK_149', true), 12900);
    assert.equal(computeFinalAmountPaise('UNLIMITED_PASS_299', false), 29900);
    assert.equal(computeFinalAmountPaise('UNLIMITED_PASS_299', true), 24900);
  });

  it('validates personal campus referral code format', () => {
    assert.equal(isValidReferralCodeFormat('ALEX-4821'), true);
    assert.equal(isValidReferralCodeFormat('srish-9912'), true);
    assert.equal(isValidReferralCodeFormat('INTERV-12345'), true);
    assert.equal(isValidReferralCodeFormat(''), false);
    assert.equal(isValidReferralCodeFormat('INVALIDCODE'), false);
    assert.equal(isValidReferralCodeFormat('A-12'), false);
  });

  it('constructs valid NPCI UPI deep-link intent URIs', () => {
    const uri = buildUpiDeepLink({
      vpa: 'intervai@upi',
      payeeName: 'IntervAI Prep',
      amountPaise: 12900,
      orderId: 'ORDER_UPI_999',
    });
    assert.equal(
      uri,
      'upi://pay?pa=intervai@upi&pn=IntervAI%20Prep&am=129.00&cu=INR&tn=IntervAI_ORDER_UPI_999'
    );
  });

  it('computes per-interview unit economics cost accurately', () => {
    assert.equal(computePerInterviewCostRupees(14900, 5), 30);
    assert.equal(computePerInterviewCostRupees(29900, 30), 10);
    assert.equal(computePerInterviewCostRupees(4900, 1), 49);
    assert.equal(computePerInterviewCostRupees(4900, 0), 0);
  });

  it('computes referral savings percentage across plan tiers', () => {
    assert.equal(computeSavingsPercentage('SINGLE_MOCK_49', true), 20);
    assert.equal(computeSavingsPercentage('STARTER_PACK_149', true), 13);
    assert.equal(computeSavingsPercentage('UNLIMITED_PASS_299', true), 17);
    assert.equal(computeSavingsPercentage('SINGLE_MOCK_49', false), 0);
    assert.equal(computeSavingsPercentage('INVALID_TIER', true), 0);
  });
});
