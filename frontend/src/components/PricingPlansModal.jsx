import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Sparkles,
  Tag,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Award,
  Flame,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { billingApi } from '../api/billing';

const FALLBACK_PLANS = [
  {
    id: 'SINGLE_MOCK_49',
    name: 'Single Mock Interview',
    tag: 'Single Ticket',
    amountPaise: 4900,
    amountRupees: 49,
    credits: 1,
    description: 'Perfect for a quick dress rehearsal before tomorrow’s technical round.',
    features: [
      '1 Full AI Technical Mock Interview',
      'Comprehensive PDF Executive Dossier',
      '5-Axis Competency Radar Chart',
      'Cryptographic Verification Badge'
    ],
    isPopular: false
  },
  {
    id: 'STARTER_PACK_149',
    name: 'Placement Starter Pack',
    tag: 'Most Popular',
    amountPaise: 14900,
    amountRupees: 149,
    credits: 5,
    description: 'Multi-round preparation covering DSA, System Design & Behavioral.',
    features: [
      '5 AI Technical & Behavioral Mock Sessions',
      'Side-by-side Model vs Answer Breakdown',
      'Live Code Execution Sandbox (4 Languages)',
      'Peer Percentile Benchmarking & Rank',
      'WhatsApp & LinkedIn 1-Click Viral Sharing'
    ],
    isPopular: true
  },
  {
    id: 'UNLIMITED_PASS_299',
    name: '30-Day Campus Mastery Pass',
    tag: 'Best Value',
    amountPaise: 29900,
    amountRupees: 299,
    credits: 30,
    description: 'Ultimate prep pass for high-intensity campus hiring seasons.',
    features: [
      '30 AI Mock Interviews (Technical, System Design, HR)',
      'Unlimited Monaco Code Sandbox Runs',
      'Personalized Recruiter Hiring Recommendations',
      'Dedicated Speech Cadence & Audio Playback Analysis',
      'Campus Referral Booster (+1 credit per friend)'
    ],
    isPopular: false
  }
];

export default function PricingPlansModal() {
  const {
    isPricingModalOpen,
    closePricingModal,
    plans,
    wallet,
    highlightedTier,
    startUpiCheckout
  } = useWallet();

  const [referralInput, setReferralInput] = useState('');
  const [referralStatus, setReferralStatus] = useState(null); // { valid, message, referrerName, discountRupees }
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [processingTier, setProcessingTier] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const activePlans = plans && plans.length > 0 ? plans : FALLBACK_PLANS;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPricingModalOpen) {
        closePricingModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPricingModalOpen, closePricingModal]);

  if (!isPricingModalOpen) return null;

  const getDiscountForTier = (tierId) => {
    if (!referralStatus?.valid) return 0;
    if (tierId === 'SINGLE_MOCK_49') return 10;
    if (tierId === 'STARTER_PACK_149') return 20;
    if (tierId === 'UNLIMITED_PASS_299') return 50;
    return 0;
  };

  const handleApplyReferral = async (e) => {
    e.preventDefault();
    if (!referralInput.trim()) return;
    setValidatingReferral(true);
    setErrorMessage(null);
    try {
      const res = await billingApi.validateReferral({
        referralCode: referralInput.trim(),
        planTier: highlightedTier || 'STARTER_PACK_149'
      });
      setReferralStatus(res);
    } catch (err) {
      setReferralStatus({
        valid: false,
        message: err.response?.data?.message || 'Unable to verify referral code.'
      });
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleSelectPlan = async (tierId) => {
    setProcessingTier(tierId);
    setErrorMessage(null);
    try {
      const order = await billingApi.createOrder({
        planTier: tierId,
        referralCode: referralStatus?.valid ? referralInput.trim() : undefined
      });
      startUpiCheckout(order);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not initialize UPI checkout. Please try again.');
    } finally {
      setProcessingTier(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePricingModal();
      }}
    >
      <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden my-8">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-900/50 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Student-First UPI Micro-Credits</span>
            </div>
            <h2 id="pricing-modal-title" className="mt-1 text-2xl font-bold text-white">
              Unlock Placement-Ready AI Mock Interviews
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Instant UPI top-up via GPay, PhonePe, Paytm & BHIM. Zero subscriptions. Credits never expire.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {wallet && (
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-zinc-400">Current Balance</p>
                  <p className="text-sm font-bold text-white">
                    {wallet.totalAvailableInterviews} {wallet.totalAvailableInterviews === 1 ? 'Credit' : 'Credits'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={closePricingModal}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              aria-label="Close pricing modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Campus Referral Discount Bar */}
          <form
            onSubmit={handleApplyReferral}
            className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Have a Campus Peer Referral Code?</h3>
                <p className="text-xs text-zinc-400">
                  Save up to ₹50 instantly on packs & reward your friend with 1 bonus mock credit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralInput}
                onChange={(e) => {
                  setReferralInput(e.target.value.toUpperCase());
                  if (referralStatus) setReferralStatus(null);
                }}
                placeholder="e.g. ALEX-4821"
                className="w-full sm:w-44 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-mono uppercase tracking-wider text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={validatingReferral || !referralInput.trim()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {validatingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
          </form>

          {/* Referral Feedback Banner */}
          {referralStatus && (
            <div
              className={`mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${
                referralStatus.valid
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              }`}
            >
              {referralStatus.valid ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{referralStatus.message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 3-Column Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activePlans.map((plan) => {
              const discount = getDiscountForTier(plan.id);
              const finalPrice = Math.max(1, plan.amountRupees - discount);
              const perInterviewCost = Math.round(finalPrice / plan.credits);
              const isHighlighted = plan.isPopular || highlightedTier === plan.id;
              const isLoading = processingTier === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                    plan.isPopular
                      ? 'border-orange-500/60 bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-950 shadow-lg shadow-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  {plan.tag && (
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          plan.isPopular
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : plan.id === 'UNLIMITED_PASS_299'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {plan.isPopular && <Flame className="h-3 w-3" />}
                        {plan.id === 'UNLIMITED_PASS_299' && <Award className="h-3 w-3" />}
                        {plan.tag}
                      </span>
                      <span className="text-xs font-medium text-zinc-400">
                        ~₹{perInterviewCost}/mock
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="mt-1.5 text-xs text-zinc-400 min-h-[34px]">{plan.description}</p>

                    {/* Price Block */}
                    <div className="mt-5 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-white">
                        ₹{finalPrice}
                      </span>
                      {discount > 0 && (
                        <span className="text-base font-medium text-zinc-500 line-through">
                          ₹{plan.amountRupees}
                        </span>
                      )}
                      <span className="text-xs font-medium text-zinc-400">
                        / {plan.credits} {plan.credits === 1 ? 'interview' : 'interviews'}
                      </span>
                    </div>

                    {discount > 0 && (
                      <p className="mt-1 text-xs font-medium text-emerald-400">
                        You save ₹{discount} with campus code!
                      </p>
                    )}

                    {/* Feature List */}
                    <ul className="mt-6 space-y-2.5 text-xs text-zinc-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={processingTier !== null}
                    className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      plan.isPopular
                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    } disabled:opacity-60`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating UPI QR...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4" />
                        <span>Pay ₹{finalPrice} via UPI</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust & UPI Badges Footer */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>256-bit HMAC-SHA256 verified UPI settlement • Instant credit unlock</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-zinc-500 font-medium">Supported Apps:</span>
              <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">GPay</span>
              <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">PhonePe</span>
              <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">Paytm</span>
              <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">BHIM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
