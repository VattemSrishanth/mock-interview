import React from 'react';
import { Clock } from 'lucide-react';
import { evaluateResponsePacing, formatElapsedTime } from '../utils/pacingUtils';

/**
 * InterviewTimerBadge displays response pacing feedback and recording status
 * to help candidates track timing against standard interview question pacing rubrics.
 */
export default function InterviewTimerBadge({
  elapsedSeconds = 0,
  isRecording = false,
  targetMaxSeconds = 180,
}) {
  const formatted = formatElapsedTime(elapsedSeconds);
  const {
    label: pacingLabel,
    badgeClass: pacingColor,
    barClass,
    progressPercent,
    mins,
    secs,
  } = evaluateResponsePacing(elapsedSeconds, 60, targetMaxSeconds);

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
        className={`flex flex-col gap-1 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${pacingColor}`}
        title={`Elapsed: ${formatted} (${pacingLabel})`}
      >
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-semibold">{formatted}</span>
          <span className="text-[10px] uppercase font-sans tracking-wider opacity-75 hidden sm:inline ml-1 border-l border-white/10 pl-1.5">
            {pacingLabel}
          </span>
        </div>
        <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${barClass}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
