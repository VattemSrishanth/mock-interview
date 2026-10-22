import React, { useState, useEffect } from 'react';
import { shareApi } from '../api/share';
import {
  Share2, Link2, Copy, Check, ExternalLink, Globe, Lock, RefreshCw, X
} from 'lucide-react';

export default function ShareInterviewModal({ interviewId, isOpen, onClose }) {
  const [shareStatus, setShareStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !interviewId) return;
    setLoading(true);
    setError('');
    shareApi.getShareStatus(interviewId)
      .then(setShareStatus)
      .catch(() => setError('Could not load sharing status.'))
      .finally(() => setLoading(false));
  }, [isOpen, interviewId]);

  const handleToggle = async () => {
    setToggling(true);
    setError('');
    try {
      const result = await shareApi.toggleShare(interviewId);
      setShareStatus(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to toggle sharing.');
    } finally {
      setToggling(false);
    }
  };

  const getFullShareUrl = () => {
    if (!shareStatus?.shareToken) return '';
    return `${window.location.origin}/report/${shareStatus.shareToken}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullShareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl bg-zinc-900 border border-zinc-700/50 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share Interview Report</h3>
              <p className="text-[11px] text-zinc-400">Generate a public link for recruiters & mentors</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-zinc-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading sharing status...
          </div>
        ) : (
          <>
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-3">
                {shareStatus?.isPubliclyShared ? (
                  <Globe className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-zinc-500" />
                )}
                <div>
                  <p className="text-xs font-bold text-white">
                    {shareStatus?.isPubliclyShared ? 'Public Sharing Active' : 'Report is Private'}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {shareStatus?.isPubliclyShared
                      ? 'Anyone with the link can view your performance dossier'
                      : 'Only you can see this interview report'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  shareStatus?.isPubliclyShared ? 'bg-emerald-500' : 'bg-zinc-600'
                } ${toggling ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                    shareStatus?.isPubliclyShared ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Share URL */}
            {shareStatus?.isPubliclyShared && shareStatus?.shareToken && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-700/50">
                  <Link2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={getFullShareUrl()}
                    className="flex-1 bg-transparent text-xs text-zinc-300 font-mono outline-none truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 text-[11px] font-bold transition"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <a
                  href={getFullShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open public report in new tab
                </a>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">{error}</p>
            )}

            {/* Info */}
            <div className="text-[10px] text-zinc-500 space-y-1 border-t border-zinc-800 pt-3">
              <p>• Your shared report includes scores, feedback, and question responses.</p>
              <p>• You can revoke access at any time by toggling sharing off.</p>
              <p>• The link is cryptographically unique and cannot be guessed.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

