import React from 'react';

const BARS_DISTRIBUTION = [32, 55, 42, 78, 60, 88, 48, 96, 68, 82, 54, 90, 62, 75, 45, 65, 38, 50];

const LiveAudioWave = React.memo(function LiveAudioWave({ 
  isActive = false, 
  isAiSpeaking = false,
  audioLevel = null,
  showStatusLabel = true
}) {
  const isLive = Boolean(isActive || isAiSpeaking);
  const statusLabel = isActive 
    ? 'CANDIDATE MIC ACTIVE' 
    : isAiSpeaking 
      ? 'INTERVIEWER SPEAKING' 
      : 'AUDIO STANDBY';

  const barColor = isActive 
    ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' 
    : isAiSpeaking 
      ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]' 
      : 'bg-zinc-700/50';

  return (
    <div 
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-2.5 backdrop-blur-md transition-all duration-300"
      role="region"
      aria-label={`Live audio wave status: ${statusLabel}`}
    >
      <div 
        className="flex h-10 w-full items-end justify-center gap-1 px-2"
        aria-hidden="true"
      >
        {BARS_DISTRIBUTION.map((heightPercent, index) => {
          const dynamicScale = audioLevel !== null && isLive
            ? Math.max(0.2, Math.min(1.0, audioLevel * (heightPercent / 60)))
            : Math.max(0.25, heightPercent / 100);

          return (
            <span
              key={index}
              className={`w-1 origin-bottom rounded-full transition-transform duration-150 ${isLive ? 'audio-meter-bar' : 'scale-y-[0.12]'} ${barColor}`}
              style={
                isLive
                  ? {
                      height: '100%',
                      '--meter-scale': dynamicScale,
                      animationDelay: `${index * 42}ms`,
                      animationDuration: `${550 + (index % 4) * 120}ms`,
                    }
                  : { height: '100%' }
              }
            />
          );
        })}
      </div>

      {showStatusLabel && (
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          <span 
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isActive 
                ? 'bg-orange-500 animate-pulse shadow-[0_0_6px_#f97316]' 
                : isAiSpeaking 
                  ? 'bg-sky-400 animate-pulse shadow-[0_0_6px_#38bdf8]' 
                  : 'bg-zinc-600'
            }`} 
          />
          <span className={isActive ? 'text-orange-400' : isAiSpeaking ? 'text-sky-300' : 'text-zinc-500'}>
            {statusLabel}
          </span>
        </div>
      )}
    </div>
  );
});

export default LiveAudioWave;
