import React from 'react';

const bars = [40, 75, 55, 90, 60, 30, 85, 45, 95, 70, 50, 80, 65, 35, 90, 55, 75, 40];

const LiveAudioWave = React.memo(function LiveAudioWave({ isActive, isAiSpeaking }) {
  const playing = isActive || isAiSpeaking;
  return (
    <div className="flex h-12 items-end justify-center gap-1 rounded border border-zinc-800 bg-zinc-950/60 px-4 py-2" aria-label={isActive ? 'Microphone input active' : isAiSpeaking ? 'Question audio playing' : 'Audio idle'}>
      {bars.map((height, index) => (
        <span
          key={index}
          className={`h-full w-1 origin-bottom rounded-sm ${playing ? 'audio-meter-bar' : 'scale-y-[0.15]'} ${isActive ? 'bg-orange-500' : isAiSpeaking ? 'bg-zinc-300' : 'bg-zinc-700'}`}
          style={playing ? { '--meter-scale': Math.max(0.25, height / 100), animationDelay: `${index * 45}ms`, animationDuration: `${650 + (index % 5) * 100}ms` } : undefined}
          aria-hidden="true"
        />
      ))}
    </div>
  );
});

export default LiveAudioWave;
