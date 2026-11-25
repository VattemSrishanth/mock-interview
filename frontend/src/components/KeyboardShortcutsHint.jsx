import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const DEFAULT_SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], action: 'Submit current response' },
  { keys: ['M'], action: 'Toggle voice microphone' },
  { keys: ['Esc'], action: 'Dismiss active modal or hint' },
];

/**
 * Displays an unobtrusive toggleable shortcut reference card for candidates
 * during live mock interviews and coding assessments.
 */
export default function KeyboardShortcutsHint({ shortcuts = DEFAULT_SHORTCUTS }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Toggle keyboard shortcuts"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151f33] hover:bg-white/10 border border-white/10 text-[11px] font-medium text-slate-300 transition"
      >
        <Keyboard className="w-3.5 h-3.5 text-brand-400" />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Interview keyboard shortcuts"
          className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0d1322] border border-white/15 p-3.5 shadow-2xl z-40"
        >
          <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Keyboard Shortcuts
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close shortcuts"
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-2">
            {shortcuts.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-400">{item.action}</span>
                <span className="flex items-center gap-1 shrink-0">
                  {item.keys.map((k, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="px-1.5 py-0.5 rounded bg-[#151f33] border border-white/15 font-mono text-[10px] text-brand-300"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
