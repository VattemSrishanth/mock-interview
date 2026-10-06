import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../api/interview';
import { 
  Bot, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import LiveAudioWave from '../components/LiveAudioWave';

export default function InterviewLobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [micTesting, setMicTesting] = useState(false);
  const [micSuccess, setMicSuccess] = useState(false);
  const [speakerTesting, setSpeakerTesting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await interviewApi.getById(id);
        setInterview(data);
      } catch (err) {
        setError('Could not locate requested interview session.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  const testMicrophone = async () => {
    setMicTesting(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicSuccess(true);
        // stop tracks after test
        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
          setMicTesting(false);
        }, 1500);
      } else {
        setMicSuccess(true);
        setTimeout(() => setMicTesting(false), 1200);
      }
    } catch (e) {
      console.warn("Microphone permission prompt skipped or denied:", e);
      setMicSuccess(true); // Allow fallback text mode
      setMicTesting(false);
    }
  };

  const testAudioOutput = () => {
    setSpeakerTesting(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("IntervAI audio test. Audio is functional.");
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakerTesting(false);
      utterance.onerror = () => setSpeakerTesting(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setSpeakerTesting(false), 1000);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      await interviewApi.start(id);
      navigate(`/interviews/${id}/live`);
    } catch (err) {
      console.error(err);
      // Navigate anyway if already started
      navigate(`/interviews/${id}/live`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin" />
        <p className="text-slate-400 text-sm">Preparing interview lobby...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Interview Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Session could not be retrieved.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Interview Calibration & Ready Check</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Ready for your <span className="text-brand-400">{interview.jobRole}</span> Simulation?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ensure your audio devices are ready. You can answer using voice recognition or typing.
        </p>
      </div>

      {/* Grid: Session Summary & Device Check */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Left: Session Spec */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Session Configuration
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Target Role</span>
              <span className="font-semibold text-white">{interview.jobRole}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Track Type</span>
              <span className="font-semibold text-indigo-300">{interview.interviewType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Target Seniority</span>
              <span className="font-semibold text-white">{interview.experience}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Difficulty Curve</span>
              <span className={`font-semibold ${
                interview.difficulty === 'Hard' ? 'text-red-400' :
                interview.difficulty === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{interview.difficulty}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Total Questions</span>
              <span className="font-semibold text-white">{interview.questions?.length || 5} Questions</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-2">Evaluated Skills:</div>
            <div className="flex flex-wrap gap-1.5">
              {(interview.skills || ['React', 'JavaScript', 'Problem Solving']).map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-[#151f33] text-brand-400 text-xs font-mono border border-brand-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Device Readiness & Rules */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Audio Hardware Readiness
            </h2>

            {/* Mic check */}
            <div className="p-4 rounded-xl bg-[#151f33] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${micSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Microphone Input</div>
                  <div className="text-[10px] text-slate-400">
                    {micSuccess ? 'Speech-to-text input ready' : 'Test speech detection'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={testMicrophone}
                disabled={micTesting}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition"
              >
                {micTesting ? 'Listening...' : micSuccess ? 'Retest' : 'Check Mic'}
              </button>
            </div>

            {/* Speaker check */}
            <div className="p-4 rounded-xl bg-[#151f33] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">AI Voice Synthesis</div>
                  <div className="text-[10px] text-slate-400">
                    {speakerTesting ? 'Playing sample audio...' : 'Test question narration'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={testAudioOutput}
                disabled={speakerTesting}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition"
              >
                {speakerTesting ? 'Speaking...' : 'Play Test'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Tips for Best Evaluation:</p>
              <p>&bull; Use the STAR format (Situation, Task, Action, Result) for behavioral answers.</p>
              <p>&bull; Outline technical trade-offs before choosing a specific library or pattern.</p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition active:scale-98"
          >
            {starting ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Live Interview Room</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
