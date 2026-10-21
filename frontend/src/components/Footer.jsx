import React from 'react';
import { Bot, Terminal } from 'lucide-react';

export default function Footer() {
  return <footer className="mt-16 border-t border-zinc-800 bg-zinc-950 py-6 text-zinc-500">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div className="flex items-center gap-2"><Bot size={15} className="text-orange-400" /><span className="font-medium text-zinc-300">IntervAI</span><span className="text-zinc-700">/</span><span>Technical interview practice workspace</span></div>
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"><Terminal size={12} /> {new Date().getFullYear()} · Browser-based practice</span>
    </div>
  </footer>;
}
