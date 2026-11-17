import api from './client';

export const billingApi = {
  /**
   * Fetch authenticated candidate's live credit wallet and remaining free trials.
   */
  getWallet: async () => {
    const response = await api.get('/billing/wallet');
    return response.data;
  },

  /**
   * Fetch public catalog of student-friendly UPI micro-pricing plans.
   */
  getPlans: async () => {
    const response = await api.get('/billing/plans');
    return response.data;
  },

  /**
   * Initialize a UPI payment order with deep-link generation and optional referral discount.
   */
  createOrder: async ({ planTier, referralCode }) => {
    const response = await api.post('/billing/create-order', {
      planTier,
      referralCode: referralCode?.trim() || undefined,
    });
    return response.data;
  },

  /**
   * Verify completed UPI payment and immediately credit interview balance.
   */
  verifyPayment: async ({ orderId, paymentId, signature, upiId }) => {
    const response = await api.post('/billing/verify-payment', {
      orderId,
      paymentId,
      signature,
      upiId,
    });
    return response.data;
  },

  /**
   * Fetch candidate's transaction ledger and payment invoices.
   */
  getTransactions: async () => {
    const response = await api.get('/billing/transactions');
    return response.data;
  },

  /**
   * Validate a campus referral code and preview instant pricing discount.
   */
  validateReferral: async ({ referralCode, planTier }) => {
    const response = await api.post('/billing/referral/validate', {
      referralCode: referralCode?.trim(),
      planTier,
    });
    return response.data;
  },

  /**
   * Retrieve candidate's referral statistics, conversion count, and bonus credits earned.
   */
  getReferralStats: async () => {
    const response = await api.get('/billing/referral/stats');
    return response.data;
  },
};
