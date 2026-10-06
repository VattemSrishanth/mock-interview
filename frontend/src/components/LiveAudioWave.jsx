import React from 'react';

export default function LiveAudioWave({ isActive, isAiSpeaking }) {
  const bars = [40, 75, 55, 90, 60, 30, 85, 45, 95, 70, 50, 80, 65, 35, 90, 55, 75, 40];

  return (
    <div className="flex items-center justify-center gap-1 h-12 px-4 py-2 bg-slate-900/60 rounded-xl border border-white/5">
      {bars.map((height, idx) => {
        const dynamicStyle = isActive || isAiSpeaking
          ? {
              height: `${Math.max(15, (height * (Math.sin(Date.now() / 200 + idx) + 1.2)) / 2.2)}%`,
              animation: `bounceWave ${0.8 + (idx % 5) * 0.2}s ease-in-out infinite alternate`,
              backgroundColor: isAiSpeaking ? '#818cf8' : '#4ade80'
            }
          : {
              height: '15%',
              backgroundColor: '#334155'
            };

        return (
          <div
            key={idx}
            className="w-1 rounded-full transition-all duration-150"
            style={dynamicStyle}
          />
        );
      })}
    </div>
  );
}
