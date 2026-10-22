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
  HelpCircle, 
  ArrowRight, 
  Award,
  AlertCircle,
  RefreshCw,
  LogOut,
  Camera,
  CameraOff,
  Zap,
  ShieldCheck,
  Code2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import LiveAudioWave from '../components/LiveAudioWave';
import CodeExecutionSandbox from '../components/CodeExecutionSandbox';
import { collectFinalizedResults, combineAnswerParts } from '../utils/voiceTranscript';

export default function LiveInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [spokenAnswer, setSpokenAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechStatus, setSpeechStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [typedFollowUp, setTypedFollowUp] = useState('');
  const [isEvaluatingFollowUp, setIsEvaluatingFollowUp] = useState(false);
  const [followUpEvaluation, setFollowUpEvaluation] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('Camera off');
  const [showCodeSandbox, setShowCodeSandbox] = useState(false);
  const videoRef = useRef(null);
  const cameraMountedRef = useRef(true);

  const recognitionRef = useRef(null);
  const typedAnswerRef = useRef('');
  const spokenAnswerRef = useRef('');
  const recordingRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const speechErrorRef = useRef('');
  const finalizedResultsRef = useRef(new Map());
  const sessionSpeechBaseRef = useRef('');
  const stopResolverRef = useRef(null);
  const answerText = combineAnswerParts(typedAnswer, spokenAnswer);

  useEffect(() => {
    cameraMountedRef.current = true;
    if (videoRef.current && cameraStream) videoRef.current.srcObject = cameraStream;
    return () => {
      cameraMountedRef.current = false;
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const toggleCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraStatus('Camera off');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('Camera preview is unavailable in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (!cameraMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      setCameraStream(stream);
      setCameraStatus('Local preview only · not recorded');
    } catch {
      if (cameraMountedRef.current) setCameraStatus('Camera permission denied or no camera found.');
    }
  };

  const updateTypedAnswer = (value) => {
    typedAnswerRef.current = value;
    setTypedAnswer(value);
  };

  const handleInsertCodeIntoAnswer = (snippet) => {
    setTypedAnswer((prev) => {
      const next = prev ? `${prev}\n\n${snippet}` : snippet;
      typedAnswerRef.current = next;
      return next;
    });
  };

  const updateSpokenAnswer = (value) => {
    spokenAnswerRef.current = value;
    setSpokenAnswer(value);
  };

  const clearAnswerParts = () => {
    updateTypedAnswer('');
    updateSpokenAnswer('');
    setInterimTranscript('');
    finalizedResultsRef.current.clear();
    sessionSpeechBaseRef.current = '';
  };

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
      setSpeechStatus('Speech recognition is unavailable in this browser. You can type your answer.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setSpeechStatus('Listening. Your existing typed and spoken answers are preserved.');

    recognition.onresult = (event) => {
      const { finalizedTranscript, interimTranscript: interim } = collectFinalizedResults(
        event.results,
        finalizedResultsRef.current
      );
      const sessionTranscript = combineAnswerParts(sessionSpeechBaseRef.current, finalizedTranscript);
      updateSpokenAnswer(sessionTranscript);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'Microphone permission was denied. Allow microphone access or type your answer.',
        'service-not-allowed': 'Microphone access is blocked. Allow access or type your answer.',
        'audio-capture': 'No microphone was found. You can type your answer.',
        'no-speech': 'No speech was detected. Your saved transcript is unchanged; try again or type.',
        network: 'Speech recognition could not connect. Your saved transcript is unchanged; retry or type.'
      };
      const message = messages[event.error] || 'Speech recognition stopped unexpectedly. Your saved transcript is unchanged; retry or type.';
      console.warn('Speech recognition error:', event.error);
      speechErrorRef.current = message;
      setSpeechStatus(message);
      setInterimTranscript('');
      stopRequestedRef.current = false;
      recordingRef.current = false;
      setIsRecording(false);
    };

    recognition.onend = () => {
      const wasExpected = stopRequestedRef.current;
      stopRequestedRef.current = false;
      recordingRef.current = false;
      setIsRecording(false);
      setInterimTranscript('');
      setSpeechStatus(speechErrorRef.current || (wasExpected
        ? 'Voice input stopped. Your transcript is saved.'
        : 'Voice input ended. Your transcript is saved; restart the microphone to continue.'));
      stopResolverRef.current?.();
      stopResolverRef.current = null;
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.onerror = null;
      recognition.onend = null;
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

  const stopRecording = (waitForEnd = false) => {
    const recognition = recognitionRef.current;
    if (!recognition || !recordingRef.current) return Promise.resolve();

    stopRequestedRef.current = true;
    setSpeechStatus('Finishing voice input…');
    if (!waitForEnd) {
      try { recognition.stop(); } catch { /* Already stopped. */ }
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        resolve();
      };
      const timeout = window.setTimeout(finish, 1000);
      stopResolverRef.current = finish;
      try {
        recognition.stop();
      } catch {
        finish();
      }
    });
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setSpeechStatus(speechSupported
        ? 'Speech recognition is unavailable. You can type your answer.'
        : 'Speech recognition is unavailable in this browser. You can type your answer.');
      return;
    }

    if (recordingRef.current) {
      stopRecording();
    } else {
      stopSpeaking();
      try {
        finalizedResultsRef.current = new Map();
        sessionSpeechBaseRef.current = spokenAnswerRef.current;
        stopRequestedRef.current = false;
        speechErrorRef.current = '';
        setSpeechStatus('Starting microphone…');
        recognitionRef.current.start();
        recordingRef.current = true;
        setIsRecording(true);
      } catch {
        recordingRef.current = false;
        setIsRecording(false);
        setSpeechStatus('Could not start the microphone. Check its permission or type your answer.');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (isEvaluating) return;

    if (recordingRef.current) await stopRecording(true);
    const finalAnswer = combineAnswerParts(typedAnswerRef.current, spokenAnswerRef.current);
    if (!finalAnswer.trim()) return;
    stopSpeaking();

    setIsEvaluating(true);
    setCurrentEvaluation(null);

    try {
      const result = await interviewApi.submitAnswer(id, {
        questionId: currentQuestion.id,
        answerText: finalAnswer.trim(),
        isSkipped: false
      });

      setCurrentEvaluation(result);
      setInterview((prev) => {
        if (!prev) return prev;
        const updated = [...(prev.questions || [])];
        updated[currentQuestionIndex] = result;
        return { ...prev, questions: updated };
      });

      const followUpQ = result.followUpQuestion || result.feedback?.followUpQuestion;
      if (followUpQ && autoNarrate && 'speechSynthesis' in window) {
        window.setTimeout(() => {
          speakQuestion("Interviewer follow-up: " + followUpQ);
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error evaluating response. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmitFollowUp = async () => {
    if (isEvaluatingFollowUp || !typedFollowUp.trim()) return;
    stopSpeaking();
    setIsEvaluatingFollowUp(true);

    try {
      const result = await interviewApi.submitFollowUp(id, {
        questionId: currentQuestion.id,
        followUpAnswerText: typedFollowUp.trim()
      });

      setFollowUpEvaluation({
        feedback: result.followUpFeedback || result.feedback?.followUpFeedback,
        score: result.followUpScore || result.feedback?.followUpScore
      });

      setCurrentEvaluation(result);
      setInterview((prev) => {
        if (!prev) return prev;
        const updated = [...(prev.questions || [])];
        updated[currentQuestionIndex] = result;
        return { ...prev, questions: updated };
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting follow-up defense. Please try again.');
    } finally {
      setIsEvaluatingFollowUp(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (isEvaluating || !currentQuestion) return;

    if (!window.confirm('Skip this question? You will receive evaluation feedback with an exemplary model answer.')) {
      return;
    }

    if (recordingRef.current) await stopRecording(true);
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
    clearAnswerParts();
    setShowHint(false);
    setTypedFollowUp('');
    setFollowUpEvaluation(null);
    setIsEvaluatingFollowUp(false);

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
          <div className="w-9 h-9 rounded border border-zinc-700 bg-zinc-900 p-0.5">
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
              className="h-full origin-left bg-orange-500 transition-transform duration-300"
              style={{ width: '100%', transform: `scaleX(${progressPercent / 100})` }}
            />
          </div>
        </div>

        {/* Right Tools: Timer & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151f33] border border-white/5 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
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
                    ? 'from-orange-500 via-brand-400 to-zinc-700 animate-pulse'
                    : 'from-slate-700 to-slate-800'
                } mx-auto transition-colors duration-300`}>
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
                  Interview facilitator
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
                  className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Guidance & Rubric' : 'Need a hint or rubric clue?'}</span>
                </button>

                {showHint && (
                  <div className="mt-2 rounded border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300 leading-relaxed space-y-1">
                    <p className="font-semibold text-orange-300">Technical rubric expectations:</p>
                    {currentQuestion?.expectedKeyPoints
                      ? <p className="whitespace-pre-line">{currentQuestion.expectedKeyPoints}</p>
                      : <><p>&bull; State the core concept, work through a concrete scenario, and explain the trade-offs.</p><p>&bull; Address relevant failure modes, performance limits, and operational consequences.</p></>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Answer Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Optional local camera monitor. Video remains in the browser and is never submitted. */}
          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <span className={`h-2 w-2 rounded-full ${cameraStream ? 'animate-pulse bg-orange-500' : 'bg-zinc-600'}`} />
                {cameraStream ? 'Local camera preview' : 'Video input · disabled'}
              </div>
              <button type="button" onClick={toggleCamera} className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-zinc-500 hover:text-white">
                {cameraStream ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                {cameraStream ? 'Turn camera off' : 'Preview camera'}
              </button>
            </div>
            {cameraStream ? <video ref={videoRef} autoPlay muted playsInline className="aspect-[16/5] w-full bg-zinc-950 object-cover" /> : <div className="flex aspect-[16/5] min-h-24 items-center justify-center bg-zinc-950/60"><div className="text-center"><CameraOff className="mx-auto h-5 w-5 text-zinc-700" /><p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Optional preview · no video is recorded or uploaded</p></div></div>}
            <p className="border-t border-zinc-800 px-4 py-2 text-[10px] text-zinc-500" role="status">{cameraStatus}</p>
          </section>
          
          {/* Live Code Execution Sandbox (Monaco + Piston) */}
          <div className="rounded-2xl border border-indigo-500/30 bg-[#0d1322] overflow-hidden shadow-lg transition-all">
            <button
              type="button"
              onClick={() => setShowCodeSandbox(!showCodeSandbox)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>Live Code Sandbox (Monaco Editor)</span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Piston Engine
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Write, run, and debug code in Python, JavaScript, Java, C++, Go with live execution
                  </p>
                </div>
              </div>
              <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition">
                <span>{showCodeSandbox ? 'Collapse Sandbox' : 'Open Code Sandbox'}</span>
                {showCodeSandbox ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showCodeSandbox && (
              <div className="p-4 border-t border-indigo-500/20 bg-slate-950/70">
                <CodeExecutionSandbox onInsertIntoAnswer={handleInsertCodeIntoAnswer} />
              </div>
            )}
          </div>

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
                    : 'bg-orange-500 hover:bg-orange-400 text-zinc-950 shadow-orange-500/10'
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
                value={typedAnswer}
                onChange={(e) => updateTypedAnswer(e.target.value)}
                placeholder="Type your response here. Use the microphone to add a separate speech transcript. Tip: Structure your answer clearly with concrete examples."
                className="w-full bg-[#151f33] border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition resize-none leading-relaxed"
              />
              <div className="absolute right-3 bottom-3 text-[11px] text-slate-500 font-mono">
                {answerText.trim().split(/\s+/).filter(Boolean).length} words &bull; {answerText.length} chars
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-y border-zinc-800 py-2.5" aria-label={isRecording ? 'Microphone speech recognition is active' : 'Microphone speech recognition is inactive'}>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Mic input · {isRecording ? 'listening' : 'standby'}</span>
              <div className="flex gap-1" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} className={`h-3 w-1.5 rounded-[1px] ${isRecording && i < 11 ? 'animate-pulse bg-orange-500' : 'bg-zinc-800'}`} style={{ animationDelay: `${i * 35}ms` }} />)}</div>
            </div>

            {(speechStatus || spokenAnswer || interimTranscript) && (
              <div className="rounded-xl bg-black/20 border border-white/5 p-3 space-y-2" aria-live="polite">
                {speechStatus && <p className="text-xs text-slate-400">{speechStatus}</p>}
                {spokenAnswer && (
                  <p className="text-xs text-slate-300 whitespace-pre-wrap">
                    <span className="text-orange-300 font-semibold">Recognized speech: </span>{spokenAnswer}
                  </p>
                )}
                {interimTranscript && (
                  <p className="text-xs text-slate-500 italic">Hearing: {interimTranscript}</p>
                )}
                {answerText && spokenAnswer && typedAnswer && (
                  <p className="text-xs text-slate-400 whitespace-pre-wrap border-t border-white/5 pt-2">
                    <span className="text-slate-300 font-semibold">Combined answer preview: </span>{answerText}
                  </p>
                )}
              </div>
            )}

            {/* Submit / Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAnswerParts}
                  disabled={!answerText || isEvaluating || isRecording}
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
                    <span>Evaluating answer…</span>
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
              <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-5 fade-enter">
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
                    <div className="text-sm font-bold text-zinc-300 mt-1">{feedbackObj.communication}%</div>
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
                    <div className="p-3 rounded border border-zinc-800 bg-zinc-950 text-zinc-300 space-y-1">
                      <span className="font-semibold text-orange-300">Evaluator suggestions:</span>
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

                {/* Step 2: Adaptive Interrogation Follow-Up Card */}
                {(() => {
                  const followUpQ = feedbackObj.followUpQuestion || currentEvaluation.followUpQuestion;
                  if (!followUpQ) return null;

                  return (
                    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-black border border-amber-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider block">Interviewer Adaptive Deep-Dive</span>
                            <span className="text-[10px] text-amber-400 font-mono font-semibold">Live Follow-Up Interrogation</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakQuestion(followUpQ)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium border border-amber-500/20 flex items-center gap-1 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Speak Follow-Up</span>
                        </button>
                      </div>

                      <div className="p-3.5 rounded-lg bg-black/50 border border-white/5 text-xs text-white leading-relaxed">
                        <p className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                          <span>Interviewer challenges:</span>
                        </p>
                        <p className="italic text-slate-200">"{followUpQ}"</p>
                      </div>

                      {/* If follow-up answered or already evaluated */}
                      {(followUpEvaluation || currentEvaluation.isFollowUpAnswered) ? (
                        <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Interrogation Defense Evaluated
                            </span>
                            {(followUpEvaluation?.score || currentEvaluation.followUpScore) != null && (
                              <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Score: {followUpEvaluation?.score || currentEvaluation.followUpScore} / 100
                              </span>
                            )}
                          </div>
                          {(followUpEvaluation?.feedback || currentEvaluation.followUpFeedback) && (
                            <p className="text-xs text-emerald-200/90 leading-relaxed">
                              {followUpEvaluation?.feedback || currentEvaluation.followUpFeedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            rows={3}
                            value={typedFollowUp}
                            onChange={(e) => setTypedFollowUp(e.target.value)}
                            placeholder="Defend your architectural choices or address the follow-up scenario here..."
                            className="w-full bg-[#151f33] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed font-mono"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {typedFollowUp.trim().split(/\s+/).filter(Boolean).length} words
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleSubmitFollowUp}
                                disabled={!typedFollowUp.trim() || isEvaluatingFollowUp}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                              >
                                {isEvaluatingFollowUp ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Evaluating Defense...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Submit Follow-Up Defense</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

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
