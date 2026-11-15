import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { coachApi } from '../api/coach';

export default function AiCoachDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      text: "👋 Hi! I'm your IntervAI Career Coach. I can analyze your target role, advise on STAR method strategies, or recommend skills to focus on. How can I assist your interview prep today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiStatus, setAiStatus] = useState({ activeProvider: 'IntervAI Neural Engine' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      coachApi.getStatus()
        .then((res) => {
          if (res?.activeProvider) {
            setAiStatus(res);
          }
        })
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
          suggestedActions: response.suggestions || response.suggestedActions || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'coach',
          text: "I'm having a momentary hitch connecting to the AI neural core. Please try again or rephrase your question.",
          isError: true
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    "How can I answer 'Tell me about yourself' effectively?",
    "What are common System Design bottlenecks to watch for?",
    "Tips for answering behavioral conflict questions with STAR"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">
                  AI Career Coach
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {aiStatus.activeProvider || 'Online'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Personalized interview advisor & mentor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI Coach"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Chat Area */}
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
                      : m.isError
                      ? 'bg-red-500/10 text-red-300 border border-red-500/20 rounded-bl-none'
                      : 'bg-[#151f33] text-slate-200 border border-white/5 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-2 space-y-1.5 pl-2">
                    <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
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
            <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-brand-400" />
              Quick Prompts:
            </p>
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
      </div>
    </div>
  );
}
