import React from 'react';
import { Zap, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function WalletCreditBadge({ collapsed = false, className = '' }) {
  const { wallet, totalCredits, openPricingModal } = useWallet();

  const freeRemaining = wallet?.freeInterviewsRemaining ?? 0;
  const paidCredits = wallet?.creditsBalance ?? 0;
  const isZero = totalCredits === 0;

  if (collapsed) {
    return (
      <button
        onClick={() => openPricingModal('STARTER_PACK_149')}
        title={`${totalCredits} Interview Credits available • Click to recharge via UPI`}
        className={`relative mx-auto my-2 flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
          isZero
            ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
            : totalCredits === 1
            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
            : 'border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
        } ${className}`}
      >
        <Zap className="h-4 w-4 fill-current" />
        <span
          className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
            isZero ? 'bg-rose-500 text-white' : 'bg-orange-500 text-black'
          }`}
        >
          {totalCredits}
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={() => openPricingModal('STARTER_PACK_149')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openPricingModal('STARTER_PACK_149');
      }}
      className={`group mx-3 my-2 flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all ${
        isZero
          ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/40 to-zinc-900/60 hover:border-rose-500/70'
          : totalCredits === 1
          ? 'border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-zinc-900/60 hover:border-amber-500/60'
          : 'border-orange-500/30 bg-gradient-to-r from-orange-950/30 to-zinc-900/60 hover:border-orange-500/60'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
            isZero
              ? 'border-rose-500/30 bg-rose-500/15 text-rose-400'
              : totalCredits === 1
              ? 'border-amber-500/30 bg-amber-500/15 text-amber-400'
              : 'border-orange-500/30 bg-orange-500/15 text-orange-400'
          }`}
        >
          <Zap className="h-4 w-4 fill-current" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-tight">
              {totalCredits} {totalCredits === 1 ? 'Credit' : 'Credits'}
            </span>
            {freeRemaining > 0 && (
              <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-semibold text-emerald-400">
                1 Free
              </span>
            )}
          </div>
          <span className="block text-[10px] text-zinc-400 group-hover:text-zinc-300">
            {isZero ? 'Top-up to practice' : 'UPI instant recharge'}
          </span>
        </div>
      </div>

      <div className="flex h-6 items-center gap-1 rounded-md bg-zinc-800/80 px-2 text-[11px] font-semibold text-orange-400 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-black transition-colors">
        <Plus className="h-3 w-3" />
        <span>Add</span>
      </div>
    </div>
  );
}
