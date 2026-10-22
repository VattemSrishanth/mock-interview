import React, { useState } from 'react';
import { Activity, Gauge, MessageSquare, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { analyzeSpeechTelemetry } from '../utils/speechTelemetry';

export default function SpeechTelemetryWidget({ text, durationSeconds = 0, isRecording = false }) {
  const [showDetails, setShowDetails] = useState(false);
  const telemetry = analyzeSpeechTelemetry(text, durationSeconds);

  if (!text && !isRecording) {
    return null;
  }

  const getPacingBadgeStyle = (status) => {
    switch (status) {
      case 'OPTIMAL':
      case 'DELIBERATE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SLOW':
      case 'FAST':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'RUSHED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getFillerBadgeStyle = (status) => {
    switch (status) {
      case 'EXCELLENT':
      case 'GOOD':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MODERATE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-slate-950/70 p-3.5 space-y-2.5 transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">
            Speech & Communication Telemetry
          </span>
          {isRecording && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              LIVE
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition"
        >
          <span>{showDetails ? 'Hide analysis' : 'View breakdown'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Speaking Rate (WPM) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-indigo-400" />
              Speaking Pace
            </span>
            <span className="font-mono text-slate-500">130-165 ideal</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-white">
              {telemetry.wordsPerMinute}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">WPM</span>
          </div>
          <div className={`mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${getPacingBadgeStyle(telemetry.pacingStatus)}`}>
            <span>{telemetry.pacingLabel}</span>
          </div>
        </div>

        {/* Filler Word Counter */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-amber-400" />
              Filler Words
            </span>
            <span className="font-mono text-slate-500">&lt;3% ideal</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-white">
              {telemetry.fillerCount}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({telemetry.fillerPercentage}%)
            </span>
          </div>
          <div className={`mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${getFillerBadgeStyle(telemetry.fillerStatus)}`}>
            <span>{telemetry.fillerLabel}</span>
          </div>
        </div>

        {/* Articulation / Duration metric */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Delivery Time
            </span>
            <span className="font-mono text-slate-500">{telemetry.totalWords} words</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-white">
              {telemetry.durationSeconds}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">seconds</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 truncate font-mono">
            {telemetry.totalWords > 0 
              ? `${(telemetry.durationSeconds / Math.max(1, telemetry.totalWords)).toFixed(2)}s per word`
              : 'Standby'}
          </div>
        </div>
      </div>

      {/* Expanded Breakdown & Coaching Tips */}
      {showDetails && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          {/* Detected Filler Words List */}
          {telemetry.fillerCount > 0 ? (
            <div>
              <p className="text-[11px] font-semibold text-slate-300 mb-1.5">
                Detected Verbal Fillers:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(telemetry.fillerBreakdown).map(([word, count]) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono"
                  >
                    <span>"{word}"</span>
                    <strong className="text-amber-400">×{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Zero filler words detected in your delivery. Articulation is clean.
            </p>
          )}

          {/* Contextual Tips */}
          {telemetry.tips && telemetry.tips.length > 0 && (
            <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/20 p-2.5 space-y-1">
              {telemetry.tips.map((tip, idx) => (
                <p key={idx} className="text-[11px] text-indigo-200 leading-relaxed flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

