import React from 'react';
import { Clock, Radio, AlertCircle } from 'lucide-react';

/**
 * InterviewTimerBadge displays response pacing feedback and recording status
 * to help candidates track timing against standard interview question pacing rubrics.
 */
export default function InterviewTimerBadge({ elapsedSeconds = 0, isRecording = false }) {
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine pacing stage based on behavioral/technical response recommendations (1-3 minutes ideal)
  let pacingLabel = 'Introductory';
  let pacingColor = 'text-slate-300 border-white/5 bg-[#151f33]';

  if (elapsedSeconds >= 60 && elapsedSeconds < 180) {
    pacingLabel = 'Optimal Pacing';
    pacingColor = 'text-amber-300 border-amber-500/20 bg-amber-500/10';
  } else if (elapsedSeconds >= 180) {
    pacingLabel = 'Wrap-up Suggested';
    pacingColor = 'text-rose-300 border-rose-500/20 bg-rose-500/10';
  }

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  return (
    <div className="flex items-center gap-2">
      {/* Live recording indicator if microphone is active */}
      {isRecording && (
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-pulse"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-mono text-[11px] tracking-wide uppercase">REC LIVE</span>
        </div>
      )}

      {/* Elapsed session & pacing badge */}
      <div 
        role="timer"
        aria-label={`Interview response timer: ${mins} minutes ${secs} seconds elapsed (${pacingLabel})`}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${pacingColor}`}
        title={`Elapsed: ${formatTimer(elapsedSeconds)} (${pacingLabel})`}
      >
        <Clock className="w-3.5 h-3.5 text-orange-400" />
        <span className="font-semibold">{formatTimer(elapsedSeconds)}</span>
        <span className="text-[10px] uppercase font-sans tracking-wider opacity-75 hidden sm:inline ml-1 border-l border-white/10 pl-1.5">
          {pacingLabel}
        </span>
      </div>
    </div>
  );
}
