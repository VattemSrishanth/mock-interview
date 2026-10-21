import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  MessageSquare,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { coachApi } from '../api/coach';

export default function AiCoachDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'settings'
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      text: "👋 Hi! I'm your Interview AI Career Coach. I can analyze your target role, advise on STAR method strategies, or recommend skills to focus on. How can I assist you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiStatus, setAiStatus] = useState({ activeProvider: 'GEMINI', hasActiveKey: true });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [providerSelect, setProviderSelect] = useState('gemini');
  const [keyUpdateSuccess, setKeyUpdateSuccess] = useState('');
  const [keyUpdateError, setKeyUpdateError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      coachApi.getStatus()
        .then((res) => setAiStatus(res))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isSending) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await coachApi.chat(text.trim());
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'coach',
          text: response.reply,
          suggestedActions: response.suggestedActions
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'coach',
          text: "I'm having a slight hitch connecting to the AI neural core. You can continue with built-in heuristics or check your API key in Settings!",
          isError: true
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setKeyUpdateSuccess('');
    setKeyUpdateError('');
    if (!apiKeyInput.trim()) {
      setKeyUpdateError('Please enter a valid API key string.');
      return;
    }

    try {
      const res = await coachApi.configureKey(providerSelect, apiKeyInput.trim());
      setKeyUpdateSuccess(res.message || 'Key configured successfully!');
      setApiKeyInput('');
      const status = await coachApi.getStatus();
      setAiStatus(status);
    } catch (err) {
      setKeyUpdateError(err.response?.data?.error || 'Failed to update API key.');
    }
  };

  const quickPrompts = [
    "How can I answer 'Tell me about yourself' effectively?",
    "What are common System Design bottlenecks to watch for?",
    "Tips for answering behavioral conflict questions with STAR"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 transition-opacity">
      <div className="w-full max-w-md bg-[#0d1322] border-l border-white/10 h-full flex flex-col shadow-2xl panel-enter">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-brand-500 p-0.5">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                AI Career Coach
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {aiStatus.activeProvider}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Personalized interview advisor & mentor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 bg-[#090d16] p-1 text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Live Chat
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            AI Key Configuration
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                        : 'bg-[#151f33] text-slate-200 border border-white/5 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-2 space-y-1.5 pl-2">
                      <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider">
                        Suggested Next Steps:
                      </p>
                      {m.suggestedActions.map((action, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5"
                        >
                          <ChevronRight className="w-3 h-3 text-brand-400 shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#151f33] p-3 rounded-2xl rounded-bl-none border border-white/5 max-w-[70%]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px]">AI Coach is crafting advice...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-white/5 bg-[#090d16]/50">
              <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">Quick Prompts:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    className="text-[11px] text-left px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5 hover:border-brand-500/30 transition truncate max-w-full"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-[#0d1322]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask for interview tactics, prep advice..."
                  className="flex-1 bg-[#151f33] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 transition active:scale-95 shadow-md shadow-brand-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-indigo-200">
                <Cpu className="w-4 h-4" />
                Dual-AI Smart Engine
              </div>
              <p>
                Interview AI comes equipped with simulated intelligent generation out-of-the-box. To connect your live Gemini or OpenAI models, provide your private key below.
              </p>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  AI Provider
                </label>
                <select
                  value={providerSelect}
                  onChange={(e) => setProviderSelect(e.target.value)}
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="gemini">Google Gemini (Default: gemini-1.5-flash)</option>
                  <option value="openai">OpenAI (Default: gpt-4o-mini)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={providerSelect === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              {keyUpdateSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{keyUpdateSuccess}</span>
                </div>
              )}

              {keyUpdateError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{keyUpdateError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-xs transition shadow-lg shadow-brand-500/20"
              >
                Save & Apply Key
              </button>
            </form>

            <div className="border-t border-white/10 pt-4 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Security Note:</p>
              <p>API keys are securely held on the backend in runtime memory and never exposed to client browsers.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
