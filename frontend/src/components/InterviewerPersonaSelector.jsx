import React, { useState } from 'react';
import { Volume2, VolumeX, Check, Sparkles, UserCheck } from 'lucide-react';
import { INTERVIEWER_PERSONAS, voiceInterviewerService } from '../services/voiceInterviewerService';

export default function InterviewerPersonaSelector({ 
  selectedPersonaId, 
  onSelectPersona, 
  compact = false 
}) {
  const [playingId, setPlayingId] = useState(null);

  const handleSelect = (persona) => {
    voiceInterviewerService.setSelectedPersona(persona.id);
    onSelectPersona?.(persona);
  };

  const handlePreview = (e, persona) => {
    e.stopPropagation();
    if (playingId === persona.id) {
      voiceInterviewerService.stopSpeaking();
      setPlayingId(null);
      return;
    }

    setPlayingId(persona.id);
    voiceInterviewerService.speak(persona.previewText, {
      personaId: persona.id,
      onStart: () => setPlayingId(persona.id),
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null)
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {INTERVIEWER_PERSONAS.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          const isPlaying = playingId === persona.id;

          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => handleSelect(persona)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                isSelected
                  ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm">{persona.avatar}</span>
              <span className="font-semibold">{persona.name}</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({persona.accent.split('/')[0].trim()})
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handlePreview(e, persona)}
                title="Preview voice"
                className={`p-0.5 rounded hover:bg-white/10 transition ${
                  isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-orange-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Select Interviewer Voice Persona
          </h4>
        </div>
        <span className="text-[11px] text-zinc-400">
          Natural speech synthesis & accent calibration
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INTERVIEWER_PERSONAS.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          const isPlaying = playingId === persona.id;

          return (
            <div
              key={persona.id}
              onClick={() => handleSelect(persona)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-orange-500/10 border-orange-500/50 shadow-md shadow-orange-950/20'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="text-2xl p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    {persona.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{persona.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        {persona.accent}
                      </span>
                    </div>
                    <p className="text-[11px] text-orange-400/90 font-medium">{persona.title}</p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="p-1 rounded-full bg-orange-500/20 text-orange-400">
                    <Check className="w-4 h-4" />
                  </span>
                ) : null}
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {persona.description}
              </p>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, persona)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    isPlaying
                      ? 'bg-orange-500 text-zinc-950 border-orange-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{isPlaying ? 'Stop Audio' : 'Preview Voice'}</span>
                </button>

                <span className="text-[10px] font-mono text-zinc-500">
                  {persona.gender} · {persona.rate}x speed
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

