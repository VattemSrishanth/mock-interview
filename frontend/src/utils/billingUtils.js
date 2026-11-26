/**
 * Billing, UPI formatting, and Campus Referral pricing calculation utilities.
 */

export const PLAN_TIERS = {
  SINGLE_MOCK_49: {
    id: 'SINGLE_MOCK_49',
    basePaise: 4900,
    credits: 1,
    referralDiscountPaise: 1000, // ₹10 off
  },
  STARTER_PACK_149: {
    id: 'STARTER_PACK_149',
    basePaise: 14900,
    credits: 5,
    referralDiscountPaise: 2000, // ₹20 off
  },
  UNLIMITED_PASS_299: {
    id: 'UNLIMITED_PASS_299',
    basePaise: 29900,
    credits: 30,
    referralDiscountPaise: 5000, // ₹50 off
  },
};

export function formatPaiseToRupees(paise) {
  if (typeof paise !== 'number' || Number.isNaN(paise) || paise < 0) {
    return '₹0';
  }
  const rupees = Math.round(paise / 100);
  return `₹${rupees}`;
}

export function calculateReferralDiscountPaise(tierId, isValidReferral) {
  if (!isValidReferral || !tierId || !PLAN_TIERS[tierId]) {
    return 0;
  }
  return PLAN_TIERS[tierId].referralDiscountPaise;
}

export function computeFinalAmountPaise(tierId, isValidReferral = false) {
  const tier = PLAN_TIERS[tierId];
  if (!tier) return 0;
  const discount = calculateReferralDiscountPaise(tierId, isValidReferral);
  return Math.max(100, tier.basePaise - discount);
}

export function isValidReferralCodeFormat(code) {
  if (typeof code !== 'string') return false;
  const cleaned = code.trim().toUpperCase();
  return /^[A-Z0-9]{2,12}-[0-9]{4,6}$/.test(cleaned);
}

export function buildUpiDeepLink({ vpa = 'intervai@upi', payeeName = 'IntervAI', amountPaise, orderId }) {
  const rupees = ((amountPaise || 0) / 100).toFixed(2);
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(`IntervAI_${orderId || 'ORDER'}`);
  return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${rupees}&cu=INR&tn=${encodedNote}`;
}

export function computePerInterviewCostRupees(finalAmountPaise, credits) {
  if (!credits || credits <= 0) return 0;
  return Math.round((finalAmountPaise / 100) / credits);
}

export function computeSavingsPercentage(tierId, isValidReferral = false) {
  const tier = PLAN_TIERS[tierId];
  if (!tier || tier.basePaise <= 0) return 0;
  const finalPaise = computeFinalAmountPaise(tierId, isValidReferral);
  return Math.max(0, Math.round(((tier.basePaise - finalPaise) / tier.basePaise) * 100));
}
