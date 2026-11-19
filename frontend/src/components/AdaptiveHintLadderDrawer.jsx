import React, { useState } from 'react';
import { Lightbulb, Lock, Unlock, ChevronRight, AlertTriangle, Check, Copy, X } from 'lucide-react';

const HINT_TIERS = [
  { level: 1, title: 'Tier 1: High-Level Conceptual Clue', penalty: 5, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { level: 2, title: 'Tier 2: Algorithmic & Data Structure Blueprint', penalty: 10, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { level: 3, title: 'Tier 3: Pseudocode & Implementation Walkthrough', penalty: 20, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
];

export default function AdaptiveHintLadderDrawer({
  isOpen,
  onClose,
  unlockedLevel = 0,
  hints = {},
  onUnlockHint,
  totalPenalty = 0,
  isLoading = false
}) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-md border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Adaptive AI Hint Ladder</h3>
            <p className="text-xs text-slate-400">Unlocks progressive problem hints</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Penalty Meter */}
      <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Active Assessment Deduction:</span>
        </div>
        <span className="font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
          -{totalPenalty} pts
        </span>
      </div>

      {/* Tiers List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {HINT_TIERS.map((tier) => {
          const isUnlocked = unlockedLevel >= tier.level;
          const hintContent = hints[`level${tier.level}`] || hints[tier.level];

          return (
            <div
              key={tier.level}
              className={`rounded-xl border transition-all ${
                isUnlocked
                  ? 'border-slate-700 bg-slate-800/60'
                  : 'border-slate-800/60 bg-slate-900/40 opacity-80'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className={`p-1.5 rounded-md ${tier.color}`}>
                    {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{tier.title}</h4>
                    <span className="text-[10px] text-slate-400">Deduction: -{tier.penalty} pts</span>
                  </div>
                </div>

                {!isUnlocked && (
                  <button
                    disabled={isLoading || unlockedLevel !== tier.level - 1}
                    onClick={() => onUnlockHint(tier.level)}
                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span>Unlock</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Card Body (Revealed) */}
              {isUnlocked && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-300 border-t border-slate-800/60 mt-1">
                  <p className="leading-relaxed whitespace-pre-line text-slate-300">
                    {hintContent?.hintText ||
                      hintContent ||
                      `Hint ${tier.level}: Consider maintaining an auxiliary index or hash map to lookup previously encountered items in O(1) time.`}
                  </p>

                  {hintContent?.codeSnippet && (
                    <div className="mt-2.5 bg-slate-950 rounded-lg p-2.5 border border-slate-800 font-mono text-[11px] text-emerald-400 relative group">
                      <pre className="overflow-x-auto">{hintContent.codeSnippet}</pre>
                      <button
                        onClick={() => handleCopy(hintContent.codeSnippet)}
                        className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition"
                        title="Copy code snippet"
                      >
                        {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        💡 In FAANG & Unicorn interviews, asking targeted clarifying questions is welcomed, but unlocking direct code blueprints incurs a benchmark calibration penalty.
      </div>
    </div>
  );
}
