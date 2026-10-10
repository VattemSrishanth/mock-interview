import React from 'react';
import { Bot, Heart, Sparkles, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#070a12] py-10 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">
              Interview <span className="text-brand-400">AI</span> Platform
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Production AI Mock Interview System</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Backend API Active &bull; Spring Boot 3.3
            </span>
            <span className="hidden sm:inline text-slate-500">
              Dual AI Engine (Gemini & OpenAI with Smart Fallback)
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Interview AI Technologies. Engineered for aspiring software engineers.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition cursor-pointer">Security Standards</span>
            <span className="hover:text-slate-300 transition cursor-pointer">API Reference</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Privacy & Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
