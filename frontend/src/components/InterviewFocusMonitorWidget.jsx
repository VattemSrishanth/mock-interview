import React, { useState, useEffect } from 'react';
import { Eye, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import InterviewTimerBadge from './InterviewTimerBadge';

/**
 * Live proctoring focus telemetry widget that monitors candidate tab focus,
 * window switching, and integrates the real-time InterviewTimerBadge response pacing HUD.
 */
export default function InterviewFocusMonitorWidget({
  elapsedSeconds = 0,
  isRecording = false,
  onFocusWarning = null,
}) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowFocused(false);
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          if (onFocusWarning) onFocusWarning(next);
          return next;
        });
      } else {
        setIsWindowFocused(true);
      }
    };

    const handleWindowBlur = () => {
      setIsWindowFocused(false);
    };

    const handleWindowFocus = () => {
      setIsWindowFocused(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [onFocusWarning]);

  return (
    <div className="flex items-center gap-3">
      {/* Pacing Timer Badge */}
      <InterviewTimerBadge elapsedSeconds={elapsedSeconds} isRecording={isRecording} />

      {/* Proctoring Integrity Indicator */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
          !isWindowFocused || tabSwitchCount > 2
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : tabSwitchCount > 0
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
        }`}
        title={`Placement Drive Integrity Monitor: ${tabSwitchCount} tab switch(es) detected`}
      >
        {!isWindowFocused ? (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span className="text-[11px] font-semibold">
          {!isWindowFocused ? 'FOCUS LOST' : tabSwitchCount === 0 ? 'INTEGRITY VERIFIED' : `${tabSwitchCount} TAB SWITCH`}
        </span>
      </div>
    </div>
  );
}
