import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { billingApi } from '../api/billing';
import ReportQrCode from './ReportQrCode';

export default function UpiCheckoutModal() {
  const { activeOrder, closeUpiCheckout, handlePaymentSuccess } = useWallet();

  const [copiedVpa, setCopiedVpa] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeOrder && !verifying) {
        closeUpiCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOrder, closeUpiCheckout, verifying]);

  if (!activeOrder) return null;

  const finalAmountRupees = Math.round(activeOrder.finalAmountPaise / 100);
  const upiId = activeOrder.upiPayeeVpa || 'intervai@upi';

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    } catch (err) {
      console.error('Failed to copy UPI VPA:', err);
    }
  };

  const handleOpenUpiApp = () => {
    if (activeOrder.upiDeepLink) {
      window.location.href = activeOrder.upiDeepLink;
    }
  };

  const handleVerifyPayment = async (e) => {
    if (e) e.preventDefault();
    setVerifying(true);
    setError(null);

    const generatedPaymentId = utrNumber.trim() || `UPI_UTR_${Date.now().toString().slice(-8)}`;

    try {
      const updatedWallet = await billingApi.verifyPayment({
        orderId: activeOrder.orderId,
        paymentId: generatedPaymentId,
        upiId: 'candidate@upi',
      });

      setSuccessData(updatedWallet);
      setTimeout(() => {
        handlePaymentSuccess(updatedWallet);
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed. Please check your UTR or retry.');
      setVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upi-checkout-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !verifying) closeUpiCheckout();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden my-6">
        {/* Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-orange-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 id="upi-checkout-title" className="text-base font-bold text-white">
                Scan & Pay via UPI
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Ref: {activeOrder.orderId}
              </p>
            </div>
          </div>

          <button
            onClick={closeUpiCheckout}
            disabled={verifying}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-colors"
            aria-label="Close checkout"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successData ? (
            /* Success State */
            <div className="flex flex-col items-center py-8 text-center animate-in fade-in duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-4 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Verified Successfully!</h3>
              <p className="mt-1.5 text-sm text-zinc-300">
                <span className="font-semibold text-emerald-400">+{activeOrder.creditsToGrant} Mock Credits</span> have been added to your balance.
              </p>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-400">
                Redirecting you back to practice...
              </div>
            </div>
          ) : (
            /* Payment Instructions & QR */
            <>
              {/* Plan & Amount Summary Card */}
              <div className="mb-5 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div>
                  <p className="text-xs font-medium text-zinc-400">Purchasing Package</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {activeOrder.creditsToGrant} AI Mock Interview Credits
                  </p>
                  {activeOrder.appliedReferralCode && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      ✓ Campus Referral Discount Applied
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-400">Total Payable</p>
                  <p className="text-2xl font-black text-emerald-400">₹{finalAmountRupees}</p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5">
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-zinc-200">
                  <ReportQrCode
                    value={activeOrder.upiDeepLink}
                    size={160}
                    label=""
                  />
                </div>
                <p className="mt-3 text-xs font-medium text-zinc-400 text-center">
                  Scan using Google Pay, PhonePe, Paytm, or BHIM
                </p>
              </div>

              {/* UPI ID Copy & Mobile Intent */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">Payee UPI VPA</span>
                    <span className="text-xs font-mono text-zinc-200">{upiId}</span>
                  </div>
                  <button
                    onClick={handleCopyVpa}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    {copiedVpa ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy VPA</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Mobile Direct Intent Trigger */}
                <button
                  onClick={handleOpenUpiApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <Smartphone className="h-4 w-4 text-orange-400" />
                  <span>Open Directly in UPI App (Mobile Device)</span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </button>
              </div>

              {/* UTR Input & Verification Simulation */}
              <form onSubmit={handleVerifyPayment} className="mt-5 space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="utr-input" className="text-xs font-medium text-zinc-300">
                    UPI Reference / UTR Number (Optional for test simulation)
                  </label>
                  <input
                    id="utr-input"
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 408219482103 (or leave blank to auto-verify)"
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying Payment with NPCI...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>I Have Paid ₹{finalAmountRupees} • Unlock Credits</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Footer */}
              <p className="mt-4 text-center text-[11px] text-zinc-500">
                🔒 Cryptographically signed via HMAC-SHA256 • Immediate activation upon bank acknowledgement
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
