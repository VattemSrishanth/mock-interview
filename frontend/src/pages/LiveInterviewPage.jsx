import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../api/interview';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Award,
  AlertCircle,
  RefreshCw,
  LogOut
} from 'lucide-react';
import LiveAudioWave from '../components/LiveAudioWave';

export default function LiveInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  const recognitionRef = useRef(null);

  // Fetch interview session
  useEffect(() => {
    let cancelled = false;
    const fetchInterview = async () => {
      setLoading(true);
      setError('');
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const data = await interviewApi.getById(id);
          if (cancelled) return;
          setInterview(data);

          if (data.status === 'COMPLETED') {
            navigate(`/interviews/${id}/result`);
            return;
          }

          if (data.questions && data.questions.length > 0) {
            const firstUnansweredIndex = data.questions.findIndex((q) => !q.isAnswered);
            if (firstUnansweredIndex !== -1) {
              setCurrentQuestionIndex(firstUnansweredIndex);
            } else {
              navigate(`/interviews/${id}/result`);
            }
          }
          setLoading(false);
          return;
        } catch (err) {
          if (cancelled) return;
          const status = err.response?.status;
          const retryable = !status || status >= 500;
          if (!retryable || attempt === 2) {
            const serverMessage = err.response?.data?.message;
            setError(serverMessage || (status
              ? `Could not load this interview (HTTP ${status}). Please retry or return to your dashboard.`
              : 'Cannot reach the interview service. Check that the backend is running, then retry.'));
            setLoading(false);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
        }
      }
    };

    fetchInterview();
    return () => { cancelled = true; };
  }, [id, navigate, loadAttempt]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      setAnswerText((prev) => {
        // Append or replace smoothly
        return currentTranscript.trim();
      });
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  const currentQuestion = interview?.questions?.[currentQuestionIndex];

  // Auto narrate question when question index changes
  useEffect(() => {
    if (currentQuestion && autoNarrate && 'speechSynthesis' in window) {
      speakQuestion(currentQuestion.questionText);
    }
  }, [currentQuestionIndex, interview]);

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition isn't supported in this browser. You can type your response!");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || isEvaluating) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    stopSpeaking();

    setIsEvaluating(true);
    setCurrentEvaluation(null);

    try {
      const result = await interviewApi.submitAnswer(id, {
        questionId: currentQuestion.id,
        answerText: answerText.trim(),
        isSkipped: false
      });

      setCurrentEvaluation(result);
      setInterview((prev) => {
        if (!prev) return prev;
        const updated = [...(prev.questions || [])];
        updated[currentQuestionIndex] = result;
        return { ...prev, questions: updated };
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error evaluating response. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (isEvaluating || !currentQuestion) return;

    if (!window.confirm('Skip this question? You will receive evaluation feedback with an exemplary model answer.')) {
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    stopSpeaking();

    setIsEvaluating(true);
    setCurrentEvaluation(null);

    try {
      const result = await interviewApi.submitAnswer(id, {
        questionId: currentQuestion.id,
        answerText: '',
        isSkipped: true
      });

      setCurrentEvaluation(result);
      setInterview((prev) => {
        if (!prev) return prev;
        const updated = [...(prev.questions || [])];
        updated[currentQuestionIndex] = result;
        return { ...prev, questions: updated };
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error skipping question. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentEvaluation(null);
    setAnswerText('');
    setShowHint(false);

    if (currentQuestionIndex + 1 < (interview?.questions?.length || 0)) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Completed all questions
      handleFinishInterview();
    }
  };

  const handleFinishInterview = async () => {
    stopSpeaking();
    try {
      await interviewApi.complete(id);
      navigate(`/interviews/${id}/result`);
    } catch (err) {
      console.error(err);
      navigate(`/interviews/${id}/result`);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-400 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Connecting to live AI interview room...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Session Unavailable</h2>
        <p className="text-xs text-slate-400">{error || 'Interview session missing.'}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setInterview(null); setLoading(true); setLoadAttempt((attempt) => attempt + 1); }}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-semibold"
          >
            Retry Loading
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = interview.questions?.length || 0;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Live Header Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 p-0.5">
            <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{interview.jobRole}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                {interview.interviewType}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
        </div>

        {/* Center Progress Bar */}
        <div className="hidden md:flex flex-col items-center w-48">
          <div className="flex justify-between w-full text-[10px] text-slate-400 mb-1">
            <span>Session Progress</span>
            <span className="text-brand-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right Tools: Timer & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151f33] border border-white/5 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Do you wish to exit? Current progress is preserved.')) {
                navigate('/dashboard');
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Exit Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left AI Interviewer, Right Candidate Response */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Interviewer & Question Display (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/10 space-y-5">
            
            {/* AI Avatar & Audio Visualizer */}
            <div className="text-center space-y-3 pb-4 border-b border-white/5">
              <div className="relative inline-block">
                <div className={`w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr ${
                  isAiSpeaking 
                    ? 'from-indigo-500 via-brand-400 to-purple-500 animate-pulse' 
                    : 'from-slate-700 to-slate-800'
                } mx-auto transition-all duration-300`}>
                  <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center">
                    <Bot className={`w-10 h-10 ${isAiSpeaking ? 'text-brand-400 scale-105' : 'text-slate-400'} transition`} />
                  </div>
                </div>
                {isAiSpeaking && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500"></span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  Interview AI Senior Evaluator
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAiSpeaking ? 'Narrating question...' : isEvaluating ? 'Evaluating your answer...' : 'Listening actively'}
                </p>
              </div>

              {/* Dynamic waveform visualizer */}
              <LiveAudioWave isActive={isRecording} isAiSpeaking={isAiSpeaking} />

              {/* Voice controls */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isAiSpeaking) stopSpeaking();
                    else if (currentQuestion) speakQuestion(currentQuestion.questionText);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#151f33] hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/5 flex items-center gap-1.5 transition"
                >
                  {isAiSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-brand-400" />}
                  <span>{isAiSpeaking ? 'Stop Audio' : 'Speak Question'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoNarrate(!autoNarrate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    autoNarrate
                      ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                      : 'bg-[#151f33] border-white/5 text-slate-400'
                  }`}
                >
                  Auto-voice: {autoNarrate ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Question Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-400 font-semibold uppercase tracking-wider text-[10px]">
                  Topic: {currentQuestion?.targetSkill || currentQuestion?.category || 'Core Competency'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 font-mono">
                  {currentQuestion?.difficulty || interview.difficulty}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                "{currentQuestion?.questionText}"
              </h2>

              {/* Hint toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Guidance & Rubric' : 'Need a hint or rubric clue?'}</span>
                </button>

                {showHint && (
                  <div className="mt-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed space-y-1">
                    <p className="font-semibold text-indigo-100">Key Points Evaluator Looks For:</p>
                    <p>&bull; Be structured: state the core concept, provide a concrete code/design scenario, and articulate trade-offs.</p>
                    <p>&bull; Mention relevant performance bottlenecks or memory implications where applicable.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Answer Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Answer Text Area Card */}
          <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>Your Answer Formulation</span>
                {isRecording && (
                  <span className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Recording Live Speech...
                  </span>
                )}
              </h3>

              {/* Mic toggle */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? 'Stop Mic' : 'Voice Input (Mic)'}</span>
              </button>
            </div>

            {/* Response Textarea */}
            <div className="relative">
              <textarea
                rows={9}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Speak naturally using your microphone, or type your response here... Tip: Structure your answer clearly with concrete examples."
                className="w-full bg-[#151f33] border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition resize-none leading-relaxed"
              />
              <div className="absolute right-3 bottom-3 text-[11px] text-slate-500 font-mono">
                {answerText.trim().split(/\s+/).filter(Boolean).length} words &bull; {answerText.length} chars
              </div>
            </div>

            {/* Submit / Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnswerText('')}
                  disabled={!answerText || isEvaluating}
                  className="text-xs text-slate-400 hover:text-white disabled:opacity-30 transition px-2 py-1"
                >
                  Clear input
                </button>
                <span className="text-slate-600">&bull;</span>
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  disabled={isEvaluating}
                  className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-30 transition px-2 py-1 font-medium"
                >
                  Skip Question
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!answerText.trim() || isEvaluating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition active:scale-98"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Neural Scoring in progress...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Evaluate Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instant AI Evaluation Result Card */}
          {currentEvaluation && (() => {
            const feedbackObj = currentEvaluation.feedback || {};
            const isProviderEvaluation = feedbackObj.evaluationSource === 'AI_PROVIDER';
            const evalScore = feedbackObj.score ?? currentEvaluation.score;
            const strengthsList = Array.isArray(feedbackObj.strengths) ? feedbackObj.strengths : [];
            const weaknessesList = Array.isArray(feedbackObj.weaknesses) ? feedbackObj.weaknesses : [];
            const suggestionsList = Array.isArray(feedbackObj.suggestions) ? feedbackObj.suggestions : [];
            const modelAnswer = feedbackObj.modelAnswer || currentEvaluation.modelAnswer;

            return (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-[#0d1322] border border-indigo-500/40 space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand-400" />
                    <span className="text-sm font-bold text-white">{isProviderEvaluation ? 'AI Provider Evaluation' : 'Practice Guidance'}</span>
                  </div>
                  {isProviderEvaluation && evalScore != null
                    ? <div className="text-lg font-extrabold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-xl border border-brand-500/20">{evalScore} / 100</div>
                    : <span className="text-xs text-amber-300">No quality score generated</span>}
                </div>

                {!isProviderEvaluation && <p className="text-xs text-amber-200">An AI provider was unavailable. This is qualitative practice guidance, not an AI assessment.</p>}

                {/* Dimensional Metrics */}
                {isProviderEvaluation && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-400">Technical Knowledge</div>
                    <div className="text-sm font-bold text-white mt-1">{feedbackObj.technicalKnowledge}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-400">Communication</div>
                    <div className="text-sm font-bold text-indigo-300 mt-1">{feedbackObj.communication}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-400">Relevance</div>
                    <div className="text-sm font-bold text-cyan-300 mt-1">{feedbackObj.relevance}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-400">Clarity</div>
                    <div className="text-sm font-bold text-brand-400 mt-1">{feedbackObj.clarity}%</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-[10px] text-slate-400">Confidence</div>
                    <div className="text-sm font-bold text-amber-300 mt-1">{feedbackObj.confidence}%</div>
                  </div>
                </div>}

                {/* Strengths & Improvements */}
                <div className="space-y-3 text-xs leading-relaxed">
                  {strengthsList.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 space-y-1">
                      <span className="font-semibold text-emerald-200">Strengths:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {strengthsList.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weaknessesList.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 space-y-1">
                      <span className="font-semibold text-amber-200">Areas for Improvement:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {weaknessesList.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestionsList.length > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 space-y-1">
                      <span className="font-semibold text-indigo-100">Evaluator Suggestions:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {suggestionsList.map((sug, idx) => (
                          <li key={idx}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {modelAnswer && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 space-y-1">
                      <span className="font-semibold text-white">Ideal Model Answer Concept:</span>
                      <p className="italic text-slate-400">{modelAnswer}</p>
                    </div>
                  )}
                </div>

                {/* Next Question / Finish Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition active:scale-98"
                  >
                    <span>
                      {currentQuestionIndex + 1 < totalQuestions ? 'Next Question' : 'Finish & View Comprehensive Scorecard'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

      </div>
    </div>
  );
}
