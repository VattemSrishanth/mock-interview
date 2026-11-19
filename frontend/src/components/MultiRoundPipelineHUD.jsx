import React from 'react';
import { CheckCircle2, XCircle, Clock, Award, Building, ChevronRight, ShieldCheck } from 'lucide-react';

const ROUNDS_METADATA = [
  { type: 'ONLINE_ASSESSMENT', title: 'Round 1: Online Assessment (OA)', subtitle: 'Data Structures & Algorithmic Speed' },
  { type: 'TECHNICAL_PHONE_SCREEN', title: 'Round 2: Live Technical Deep-Dive', subtitle: 'Code Quality, Complexity & Edge Cases' },
  { type: 'SYSTEM_DESIGN_AND_ARCHITECTURE', title: 'Round 3: System Architecture', subtitle: 'Scalability, Concurrency & Caching' },
  { type: 'BEHAVIORAL_AND_CULTURE_FIT', title: 'Round 4: Bar Raiser & Leadership', subtitle: 'Conflict Resolution & Impact Stories' },
];

export default function MultiRoundPipelineHUD({
  companyName = 'Google',
  companyTier = 'TIER_1_PRODUCT',
  roleTitle = 'Software Development Engineer',
  currentRoundIndex = 0,
  roundResults = [],
  cumulativeScore = 0,
  cutoffThreshold = 75,
  status = 'IN_PROGRESS'
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'OFFER_EXTENDED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Offer Extended</span>;
      case 'ROUND_FAILED':
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Cutoff Not Met</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> In Progress</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Top Banner: Company, Role & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">{companyName}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {companyTier.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">{roleTitle} &bull; Virtual Assessment Center</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Cumulative Score</div>
            <div className="text-lg font-bold font-mono text-slate-100">
              <span className={cumulativeScore >= cutoffThreshold ? 'text-emerald-400' : 'text-amber-400'}>
                {cumulativeScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="text-right">
            <div className="text-xs text-slate-400">Cutoff Bar</div>
            <div className="text-lg font-bold font-mono text-slate-300">
              {cutoffThreshold}%
            </div>
          </div>

          <div className="pl-2">
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Stepper Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-5">
        {ROUNDS_METADATA.map((round, idx) => {
          const result = roundResults[idx];
          const isCompleted = result !== undefined;
          const isPassed = result?.passed;
          const isCurrent = currentRoundIndex === idx && !isCompleted;
          const isLocked = currentRoundIndex < idx;

          return (
            <div
              key={round.type}
              className={`relative p-3.5 rounded-xl border transition-all ${
                isCompleted
                  ? isPassed
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                  : isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500/50 ring-2 ring-indigo-500/20'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Stage 0{idx + 1}
                </span>
                {isCompleted ? (
                  isPassed ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {result.score}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                      <XCircle className="w-3.5 h-3.5" />
                      {result.score}%
                    </span>
                  )
                ) : isCurrent ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">LOCKED</span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{round.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{round.subtitle}</p>

              {/* Progress bar inside each card */}
              <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isCompleted
                      ? isPassed
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                      : isCurrent
                      ? 'bg-indigo-500 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{ width: isCompleted ? `${result.score}%` : isCurrent ? '50%' : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
