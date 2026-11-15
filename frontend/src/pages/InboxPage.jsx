import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import {
  Mail,
  RefreshCw,
  Trash2,
  Inbox as InboxIcon,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Clock,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export default function InboxPage() {
  const [searchParams] = useSearchParams();
  const emailFilter = searchParams.get('email') || '';

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchInbox = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await authApi.getInbox(emailFilter);
      setMessages(data || []);
      // Auto-select latest message if none selected
      setSelectedMessage((prev) => {
        if (!data || data.length === 0) return null;
        if (!prev) return data[0];
        const stillExists = data.find((m) => m.id === prev.id);
        return stillExists || data[0];
      });
    } catch (err) {
      console.error('Failed to fetch inbox messages:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [emailFilter]);

  // Initial load and periodic polling every 4 seconds
  useEffect(() => {
    fetchInbox();
    const interval = setInterval(() => {
      fetchInbox();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  const handleClearInbox = async () => {
    if (!window.confirm('Are you sure you want to clear your mailbox?')) return;
    try {
      await authApi.clearInbox();
      setMessages([]);
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to clear inbox:', err);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Mailbox Top Bar */}
      <header className="border-b border-white/10 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Candidate Secure Mailbox
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live Inbox
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {emailFilter ? `Showing inbox for: ${emailFilter}` : 'Dedicated verification email receiver'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInbox(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            title="Refresh inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearInbox}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="Clear mailbox"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <Link
            to="/register"
            className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-brand-500/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Register</span>
          </Link>
        </div>
      </header>

      {/* Main Mailbox View */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid lg:grid-cols-12 gap-6">
        {/* Left Column: Email List */}
        <div className="lg:col-span-5 bg-[#0d1322] border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <InboxIcon className="w-4 h-4 text-indigo-400" />
              <span>Incoming Messages ({messages.length})</span>
            </span>
            <span className="text-[10px] text-slate-500">Auto-updates in real time</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Loading mailbox messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Mail className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">Your mailbox is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    When you click <strong>"Send Code"</strong> on the registration portal, your 6-digit verification email will arrive here instantly.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  <span>Go to Registration Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-l-4 border-l-indigo-500'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        <span className="truncate">{msg.from}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {msg.subject}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      To: <span className="text-indigo-300">{msg.to}</span> — {msg.previewText}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Email Reader */}
        <div className="lg:col-span-7 bg-[#0d1322] border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Email Header */}
              <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {selectedMessage.subject}
                    </h2>
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <div>
                        <strong className="text-slate-300">From:</strong> {selectedMessage.from}
                      </div>
                      <div>
                        <strong className="text-slate-300">To:</strong>{' '}
                        <span className="text-indigo-300 font-medium">{selectedMessage.to}</span>
                      </div>
                      <div>
                        <strong className="text-slate-300">Received:</strong>{' '}
                        {selectedMessage.sentAt ? new Date(selectedMessage.sentAt).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  </div>

                  {/* Quick Copy Verification Code & 1-Click Verification Widget */}
                  {selectedMessage.code && (
                    <div className="bg-[#151f33] border border-indigo-500/30 rounded-xl p-3 flex flex-col items-center gap-2 shrink-0 shadow-lg shadow-indigo-950/50 min-w-[160px]">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-indigo-400" />
                        <span>Security Code</span>
                      </span>
                      <span className="text-xl font-mono font-extrabold tracking-widest text-brand-400">
                        {selectedMessage.code}
                      </span>
                      <div className="w-full flex flex-col gap-1.5 mt-1">
                        <button
                          onClick={() => handleCopyCode(selectedMessage.code)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[10px] font-semibold flex items-center justify-center gap-1 transition"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                        <a
                          href={selectedMessage.verificationLink || `/register?email=${encodeURIComponent(selectedMessage.to)}&code=${encodeURIComponent(selectedMessage.code)}`}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>1-Click Verify</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email HTML Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="email-body-container bg-[#070b14] rounded-xl border border-white/5 p-4 sm:p-6"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <div className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                    {selectedMessage.previewText}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Delivered securely to candidate mailbox</span>
                </span>
                <a
                  href={selectedMessage.verificationLink || `/register?email=${encodeURIComponent(selectedMessage.to)}&code=${encodeURIComponent(selectedMessage.code)}`}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md shadow-brand-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>1-Click Verify &amp; Return to Register</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Mail className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-xs">Select a message from the list to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

