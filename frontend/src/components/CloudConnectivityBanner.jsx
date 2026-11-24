import React, { useState } from 'react';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { CloudOff, RefreshCw, X } from 'lucide-react';

export default function CloudConnectivityBanner() {
  const { isOnline, isChecking, checkHealth } = useSystemHealth(45000);
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <CloudOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>Backend Cloud Container Waking:</strong> Free-tier servers sleep when idle. Requests may take ~30s to initialize.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-500/40 text-[11px] font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-amber-300 hover:text-amber-100 transition"
          aria-label="Dismiss cloud alert"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
