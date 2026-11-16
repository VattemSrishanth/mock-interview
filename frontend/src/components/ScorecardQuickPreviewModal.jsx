import React from 'react';
import { X, Award, ExternalLink, Download, FileDown, CheckCircle, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportInterviewReportJson, exportInterviewReportMarkdown } from '../utils/reportExportUtils';

export default function ScorecardQuickPreviewModal({ isOpen, onClose, interview }) {
  if (!isOpen || !interview) return null;

  const score = interview.overallScore;
  const isScored = score != null;
  const dateStr = interview.completedAt ? new Date(interview.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
              IA
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 block">
                Quick Scorecard Preview · IV-{String(interview.id).padStart(6, '0')}
              </span>
              <h3 className="text-base font-bold text-white">
                {interview.jobRole || 'Technical Interview'}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score & Metadata Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block">Score</span>
            <div className="font-mono text-xl font-bold text-white">
              {isScored ? `${score}%` : 'Practice'}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block">Difficulty</span>
            <div className="font-mono text-xs font-semibold text-zinc-300">
              {interview.difficulty || 'Standard'}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block">Track</span>
            <div className="font-mono text-xs font-semibold text-zinc-300">
              {interview.interviewType || 'General'}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block">Date</span>
            <div className="font-mono text-xs font-semibold text-zinc-300">
              {dateStr}
            </div>
          </div>
        </div>

        {/* Feedback Summary */}
        {interview.summaryFeedback && (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3.5 space-y-1.5">
            <span className="font-mono text-[10px] uppercase text-zinc-400 font-semibold block">
              Interviewer Evaluation Summary
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {interview.summaryFeedback}
            </p>
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportInterviewReportJson(interview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold transition"
            >
              <Download size={13} /> JSON
            </button>
            <button
              onClick={() => exportInterviewReportMarkdown(interview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold transition"
            >
              <FileDown size={13} /> Markdown
            </button>
          </div>

          <Link
            to={`/interviews/${interview.id}/result`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold transition"
          >
            <span>Open Full Dossier</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
