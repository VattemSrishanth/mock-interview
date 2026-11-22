import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  AlertOctagon,
  Monitor,
  Camera,
  CameraOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { computeIntegrityHealthScore } from '../utils/proctoringTelemetryUtils';

export default function ProctoringHeatmapWidget({
  tabSwitches = 0,
  windowBlurs = 0,
  centerGazePct = 91,
  leftGazePct = 4,
  rightGazePct = 3,
  downGazePct = 2,
  isCameraActive = true,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const health = computeIntegrityHealthScore({
    tabSwitches,
    windowBlurs,
    centerGazePct,
  });

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-5 shadow-2xl text-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Proctoring & Gaze Integrity HUD
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${health.badgeColor}`}>
                {health.status}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Eye-gaze attention zones & focus verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isCameraActive
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-500 border-white/5'
            }`}
          >
            {isCameraActive ? <Camera className="w-3.5 h-3.5 text-emerald-400" /> : <CameraOff className="w-3.5 h-3.5" />}
            {isCameraActive ? 'Proctoring Active' : 'Off'}
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Top Stat Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Integrity Score */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400">Integrity Index</span>
                <div className="text-2xl font-black text-white">{health.score}%</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Tab Switches */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400">Tab Switches</span>
                <div className="text-2xl font-black text-white">{tabSwitches}</div>
              </div>
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                  tabSwitches === 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </div>
            </div>

            {/* Center Gaze */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400">Screen Fixation</span>
                <div className="text-2xl font-black text-white">{centerGazePct}%</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Gaze Visual Distribution Sector */}
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Visual Attention Distribution</span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">Left Off-Screen</span>
                <span className="font-bold text-slate-200">{leftGazePct}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-[10px] text-indigo-300 block mb-1">Center Screen (Target)</span>
                <span className="font-extrabold text-indigo-400">{centerGazePct}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">Right Off-Screen</span>
                <span className="font-bold text-slate-200">{rightGazePct}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">Downward (Notes)</span>
                <span className="font-bold text-slate-200">{downGazePct}%</span>
              </div>
            </div>
          </div>

          {/* Deductions / Warnings list */}
          {health.deductionDetails.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" /> Proctoring Log Observations:
              </span>
              {health.deductionDetails.map((item, idx) => (
                <p key={idx} className="text-[11px] text-amber-200/90 pl-5">
                  • {item}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
