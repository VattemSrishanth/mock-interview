import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  Award,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Send,
  Star,
  FileCheck,
} from 'lucide-react';

export default function RecruiterPipelineDrawer({
  isOpen,
  onClose,
  candidate,
  onAdvanceStage,
}) {
  const [isAdvancing, setIsAdvancing] = useState(false);

  if (!isOpen || !candidate) return null;

  const stages = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'SCREENING_PASSED', label: 'Screening Passed' },
    { key: 'TECHNICAL_ROUND', label: 'Technical Round' },
    { key: 'SYSTEM_DESIGN_ROUND', label: 'System Design' },
    { key: 'BAR_RAISER', label: 'Bar Raiser' },
    { key: 'OFFER_EXTENDED', label: 'Offer Extended' },
  ];

  const currentIdx = stages.findIndex((s) => s.key === candidate.stage);

  const handleAdvance = async (nextKey) => {
    setIsAdvancing(true);
    try {
      if (onAdvanceStage) {
        await onAdvanceStage(candidate.applicationId, nextKey);
      }
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-slate-100">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                {candidate.candidateName ? candidate.candidateName.charAt(0) : 'C'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {candidate.candidateName}
                  {candidate.proctoringVerified && (
                    <span title="Verified Authentic Proctoring">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">{candidate.candidateEmail}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 my-5">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Overall Score</span>
              <span className="text-xl font-black text-indigo-400">{candidate.overallScore}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Percentile</span>
              <span className="text-xl font-black text-emerald-400">Top {100 - Math.round(candidate.percentileRank)}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-0.5">Verdict</span>
              <span className="text-xs font-bold text-teal-300 block truncate">{candidate.hiringVerdict}</span>
            </div>
          </div>

          {/* Pipeline Stage Stepper */}
          <div className="space-y-2 mb-6">
            <span className="text-xs font-semibold text-slate-300">Recruitment Pipeline Progression</span>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-3">
              {stages.map((stage, idx) => {
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={stage.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className={isCurrent ? 'font-bold text-white' : isPassed ? 'text-slate-300' : 'text-slate-500'}>
                        {stage.label}
                      </span>
                    </div>

                    {!isPassed && idx === currentIdx + 1 && (
                      <button
                        type="button"
                        disabled={isAdvancing}
                        onClick={() => handleAdvance(stage.key)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                      >
                        Advance <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Skills Observed */}
          {candidate.topSkills && candidate.topSkills.length > 0 && (
            <div className="space-y-2 mb-6">
              <span className="text-xs font-semibold text-slate-300">Verified Technical Competencies</span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.topSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Signature Card */}
          {candidate.certificateSignature && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <FileCheck className="w-4 h-4 text-teal-400" /> Digital Certificate Signature
              </div>
              <p className="text-[10px] font-mono text-slate-400 truncate">{candidate.certificateSignature}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">Target: {candidate.targetCompany}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
