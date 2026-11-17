import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { billingApi } from '../api/billing';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal orchestration state
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [highlightedTier, setHighlightedTier] = useState('STARTER_PACK_149');
  const [activeOrder, setActiveOrder] = useState(null);

  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) {
      setWallet(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await billingApi.getWallet();
      setWallet(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch credit wallet:', err);
      setError(err.response?.data?.message || 'Unable to sync credit balance');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadPlans = useCallback(async () => {
    try {
      const data = await billingApi.getPlans();
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWallet();
    } else {
      setWallet(null);
    }
  }, [isAuthenticated, refreshWallet]);

  const openPricingModal = useCallback((tier = 'STARTER_PACK_149') => {
    setHighlightedTier(tier);
    setIsPricingModalOpen(true);
  }, []);

  const closePricingModal = useCallback(() => {
    setIsPricingModalOpen(false);
  }, []);

  const startUpiCheckout = useCallback((orderResponse) => {
    setIsPricingModalOpen(false);
    setActiveOrder(orderResponse);
  }, []);

  const closeUpiCheckout = useCallback(() => {
    setActiveOrder(null);
  }, []);

  const handlePaymentSuccess = useCallback((updatedWalletSummary) => {
    if (updatedWalletSummary) {
      setWallet(updatedWalletSummary);
    } else {
      refreshWallet();
    }
    setActiveOrder(null);
  }, [refreshWallet]);

  const totalCredits = wallet?.totalAvailableInterviews ?? 0;
  const canStartInterview = wallet ? wallet.canStartInterview : true;
  const isLowBalance = isAuthenticated && wallet !== null && totalCredits <= 1;

  const value = {
    wallet,
    plans,
    loading,
    error,
    totalCredits,
    canStartInterview,
    isLowBalance,
    refreshWallet,
    isPricingModalOpen,
    highlightedTier,
    openPricingModal,
    closePricingModal,
    activeOrder,
    startUpiCheckout,
    closeUpiCheckout,
    handlePaymentSuccess,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

const FALLBACK_WALLET_CTX = {
  wallet: null,
  plans: [],
  loading: false,
  error: null,
  totalCredits: 1,
  canStartInterview: true,
  isLowBalance: false,
  refreshWallet: async () => null,
  isPricingModalOpen: false,
  highlightedTier: 'STARTER_PACK_149',
  openPricingModal: () => {},
  closePricingModal: () => {},
  activeOrder: null,
  startUpiCheckout: () => {},
  closeUpiCheckout: () => {},
  handlePaymentSuccess: () => {},
};

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    return FALLBACK_WALLET_CTX;
  }
  return ctx;
}
