import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, Activity, Mic, Clock } from 'lucide-react';

export default function AudioAnswerPlaybackCard({ question, index, audioUrl = null }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const candidateAnswer = question?.userAnswer || question?.candidateAnswer || '';
  const words = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
  // Dynamic cadence calculation based on words
  const estSeconds = Math.max(12, Math.min(180, Math.round(words / 2.3)));
  const wpm = estSeconds > 0 ? Math.round((words / estSeconds) * 60) : 0;

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3 print:border-zinc-300 print:bg-white print-break-inside-avoid">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Mic size={14} />
          </div>
          <div>
            <span className="font-mono text-[10px] text-zinc-400 block uppercase">
              Verbal Delivery Telemetry · Q{index + 1}
            </span>
            <span className="text-xs font-semibold text-zinc-200 print:text-zinc-900">
              {words} spoken words · ~{estSeconds}s duration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className={`px-2 py-0.5 rounded border ${wpm >= 120 && wpm <= 160 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
            {wpm} WPM {wpm >= 120 && wpm <= 160 ? '(Optimal)' : '(Adjust Pace)'}
          </span>
        </div>
      </div>

      {/* Simulated Waveform & Playback Controls */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 print:hidden">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-400 text-zinc-950 flex items-center justify-center transition shadow"
          title={isPlaying ? 'Pause playback' : 'Play audio transcript'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 rounded text-zinc-400 hover:text-white transition"
          title="Reset"
        >
          <RotateCcw size={13} />
        </button>

        {/* Waveform Scrubber Bars */}
        <div className="flex-1 flex items-center gap-1 h-6 cursor-pointer" onClick={() => setProgress((p) => (p + 25) % 100)}>
          {Array.from({ length: 32 }).map((_, barIdx) => {
            const barProgress = (barIdx / 32) * 100;
            const isFilled = progress >= barProgress;
            // Waveform bar heights pseudo-random based on index
            const heightMultiplier = [40, 75, 55, 90, 30, 85, 60, 95, 45, 70, 100, 35, 65, 80, 50, 90, 60, 40, 85, 95, 70, 50, 80, 65, 90, 45, 75, 60, 85, 40, 55, 30][barIdx];
            return (
              <div
                key={barIdx}
                className={`flex-1 rounded-full transition-colors duration-150 ${isFilled ? 'bg-orange-500' : 'bg-zinc-800'}`}
                style={{ height: `${heightMultiplier}%` }}
              />
            );
          })}
        </div>

        <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
          {Math.round((progress / 100) * estSeconds)}s / {estSeconds}s
        </span>
      </div>
    </div>
  );
}
