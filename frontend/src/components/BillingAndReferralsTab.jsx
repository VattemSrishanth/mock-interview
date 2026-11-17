import React, { useState, useEffect } from 'react';
import {
  Zap,
  Gift,
  Copy,
  Check,
  Receipt,
  Share2,
  MessageCircle,
  Linkedin,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Users
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { billingApi } from '../api/billing';

export default function BillingAndReferralsTab() {
  const { wallet, openPricingModal, refreshWallet } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchBillingData = async () => {
      setLoading(true);
      try {
        const [txData, refData] = await Promise.all([
          billingApi.getTransactions(),
          billingApi.getReferralStats(),
        ]);
        if (active) {
          setTransactions(Array.isArray(txData) ? txData : []);
          setReferralStats(refData);
        }
      } catch (err) {
        console.error('Failed to load billing details:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBillingData();
    refreshWallet();
    return () => { active = false; };
  }, [refreshWallet]);

  const referralCode = referralStats?.referralCode || wallet?.referralCode || 'LOADING';
  const shareUrl = referralStats?.shareUrl || `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🚀 Preparing for campus placements? Use my IntervAI referral code *${referralCode}* to get up to ₹50 OFF on AI Mock Interviews + live code execution! Sign up here: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatPlanName = (tier) => {
    switch (tier) {
      case 'SINGLE_MOCK_49': return 'Single Mock Interview (₹49)';
      case 'STARTER_PACK_149': return 'Placement Starter Pack (₹149)';
      case 'UNLIMITED_PASS_299': return '30-Day Campus Pass (₹299)';
      default: return tier || 'UPI Credits Pack';
    }
  };

  if (loading && !wallet) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Wallet Balance + Campus Referral Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Wallet Summary */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
                <Zap className="h-4 w-4 fill-current" />
                <span>Interview Credit Wallet</span>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                Active UPI Ledger
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-5xl font-black text-white">
                {wallet?.totalAvailableInterviews ?? 0}
              </span>
              <span className="text-sm font-medium text-slate-400">
                Mock Credits Available
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Paid Credits</p>
                <p className="mt-1 text-lg font-bold text-white">{wallet?.creditsBalance ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Free Trials</p>
                <p className="mt-1 text-lg font-bold text-emerald-400">{wallet?.freeInterviewsRemaining ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Completed</p>
                <p className="mt-1 text-lg font-bold text-orange-400">{wallet?.totalInterviewsCompleted ?? 0}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => openPricingModal('STARTER_PACK_149')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-black hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/15"
          >
            <Plus className="h-4 w-4" />
            <span>Recharge Credits via UPI (Starts at ₹49)</span>
          </button>
        </div>

        {/* Campus Referral Engine Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-[#0d1322] to-[#0d1322] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Gift className="h-4 w-4" />
                <span>Campus Peer Referral Engine</span>
              </div>
              <span className="text-xs font-semibold text-emerald-300">
                +1 Free Credit / Friend
              </span>
            </div>

            <h3 className="mt-2 text-lg font-bold text-white">
              Give ₹20-₹50 Off, Get Free AI Mock Interviews
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Share your personal referral code with college batchmates. They save instantly on UPI packs, and you automatically earn 1 bonus interview credit on every checkout!
            </p>

            {/* Code Copy Box */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-zinc-950/80 px-4 py-3">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">Your Personal Code</span>
                <span className="font-mono text-lg font-bold tracking-widest text-emerald-400">
                  {referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Stats Row */}
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>
                  <strong className="text-white">{referralStats?.successfulConversionsCount ?? 0}</strong> Paid Referrals
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-orange-400" />
                <span>
                  <strong className="text-white">{referralStats?.bonusCreditsEarned ?? 0}</strong> Bonus Credits Earned
                </span>
              </div>
            </div>
          </div>

          {/* 1-Click Viral Share Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Share on WhatsApp</span>
            </button>
            <button
              onClick={handleLinkedInShare}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/15 py-2.5 text-xs font-bold text-sky-300 hover:bg-sky-500/25 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              <span>Post on LinkedIn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">UPI Payment & Invoice Ledger</h3>
          </div>
          <span className="text-xs text-slate-400">{transactions.length} Transactions</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300">No UPI transactions recorded yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Your micro-transactions and instant digital receipts will appear here after your first recharge.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Order Reference</th>
                  <th className="pb-3">Package</th>
                  <th className="pb-3 text-center">Credits</th>
                  <th className="pb-3 text-right">Amount Paid</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const netPaise = Math.max(0, (tx.amountPaise || 0) - (tx.discountAmountPaise || 0));
                  const netRupees = Math.round(netPaise / 100);
                  return (
                    <tr key={tx.id || tx.orderId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-2 text-slate-400 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {tx.orderId}
                        {tx.paymentId && (
                          <span className="block text-[10px] text-slate-500">UTR: {tx.paymentId}</span>
                        )}
                      </td>
                      <td className="py-3.5 font-medium text-white">
                        {formatPlanName(tx.planTier)}
                        {tx.appliedReferralCode && (
                          <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400">
                            Code: {tx.appliedReferralCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center font-bold text-orange-400">
                        +{tx.creditsGranted}
                      </td>
                      <td className="py-3.5 text-right font-bold text-white">
                        ₹{netRupees}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        {tx.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> PAID
                          </span>
                        ) : tx.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                            <Clock className="h-3 w-3" /> PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-400">
                            <XCircle className="h-3 w-3" /> {tx.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
