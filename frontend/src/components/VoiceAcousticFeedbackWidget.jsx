import React, { useState } from 'react';
import { Activity, Mic, MicOff, Gauge, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function VoiceAcousticFeedbackWidget({
  wpm = 140,
  pitchHz = 145,
  stabilityScore = 88,
  fillerCount = 0,
  fillerBreakdown = {},
  isMicActive = false,
  voiceSteadiness = 'BALANCED',
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Pacing status & color
  let pacingColor = 'text-emerald-500';
  let pacingBg = 'bg-emerald-500/10 border-emerald-500/30';
  let pacingLabel = 'Optimal Pacing';

  if (wpm < 100) {
    pacingColor = 'text-amber-500';
    pacingBg = 'bg-amber-500/10 border-amber-500/30';
    pacingLabel = 'Too Slow';
  } else if (wpm < 125) {
    pacingColor = 'text-blue-500';
    pacingBg = 'bg-blue-500/10 border-blue-500/30';
    pacingLabel = 'Methodical';
  } else if (wpm <= 165) {
    pacingColor = 'text-emerald-500';
    pacingBg = 'bg-emerald-500/10 border-emerald-500/30';
    pacingLabel = 'Optimal (130-165)';
  } else if (wpm <= 190) {
    pacingColor = 'text-amber-500';
    pacingBg = 'bg-amber-500/10 border-amber-500/30';
    pacingLabel = 'Accelerated';
  } else {
    pacingColor = 'text-red-500';
    pacingBg = 'bg-red-500/10 border-red-500/30';
    pacingLabel = 'Rushed (>190)';
  }

  // WPM meter percentage (clamped 0 to 220)
  const meterPct = Math.min(100, Math.max(5, (wpm / 220) * 100));

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-4 shadow-xl transition-all duration-300 text-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Acoustic & Voice Cadence HUD
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Real-time speech velocity & pitch inflection analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isMicActive
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-white/5'
            }`}
          >
            {isMicActive ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-slate-500" />}
            {isMicActive ? 'Listening' : 'Muted'}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Top Row: Speedometer + Pitch Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Speedometer Gauge Card */}
            <div className={`p-3 rounded-xl border ${pacingBg} transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" /> Speech Cadence
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${pacingColor}`}>
                  {pacingLabel}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold tracking-tight text-white">{wpm}</span>
                  <span className="text-xs text-slate-400 ml-1">WPM</span>
                </div>
                <div className="text-[10px] text-slate-400">Target: 130–165 WPM</div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 mt-2.5 overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    wpm < 100
                      ? 'bg-amber-400'
                      : wpm <= 165
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${meterPct}%` }}
                />
              </div>
            </div>

            {/* Pitch & Stability Card */}
            <div className="p-3 rounded-xl border border-white/10 bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Pitch & Tone Inflection
                </span>
                <span className="text-[11px] font-semibold text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                  {voiceSteadiness}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-white">{pitchHz > 0 ? pitchHz : '--'}</span>
                  <span className="text-xs text-slate-400 ml-1">Hz</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300">
                  Stability: <span className="text-emerald-400 font-bold">{stabilityScore}%</span>
                </div>
              </div>

              {/* Visual Waveform Bar Simulation */}
              <div className="flex items-center gap-1 mt-2.5 h-2">
                {[60, 85, 45, 95, 70, 80, 50, 90, 75, 88].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-full bg-indigo-500/40 transition-all duration-200"
                    style={{
                      height: isMicActive ? `${(val * (pitchHz > 0 ? 1 : 0.2)) / 10}%` : '20%',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Filler Word Tracker */}
          <div className="p-3 rounded-xl border border-white/5 bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Verbal Filler Crutches
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  fillerCount === 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : fillerCount <= 3
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {fillerCount === 0 ? 'Zero Fillers' : `${fillerCount} Crutches`}
              </span>
            </div>

            {Object.keys(fillerBreakdown).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(fillerBreakdown).map(([word, count]) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]"
                  >
                    <span className="font-medium">"{word}"</span>
                    <span className="text-[10px] bg-amber-500/20 px-1 rounded font-bold">×{count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Clean speech pattern detected. No frequent "um", "uh", or "like" fillers detected.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
