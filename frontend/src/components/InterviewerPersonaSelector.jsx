import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Check, Sparkles, UserCheck, Activity } from 'lucide-react';
import { INTERVIEWER_PERSONAS, voiceInterviewerService } from '../services/voiceInterviewerService';

export default function InterviewerPersonaSelector({ 
  selectedPersonaId, 
  onSelectPersona, 
  compact = false,
  activeVoiceStatus = null // 'speaking' | 'listening' | 'idle' | 'evaluating' | null
}) {
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    return () => {
      voiceInterviewerService.stopSpeaking();
    };
  }, []);

  const handleSelect = (persona) => {
    if (playingId) {
      voiceInterviewerService.stopSpeaking();
      setPlayingId(null);
    }
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
      <div className="flex items-center gap-1.5 flex-wrap" role="radiogroup" aria-label="Interviewer Persona Selection">
        {INTERVIEWER_PERSONAS.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          const isPlaying = playingId === persona.id;
          const isLiveSpeaking = isSelected && (activeVoiceStatus === 'speaking' || isPlaying);

          return (
            <button
              key={persona.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(persona)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all duration-200 hud-pill ${
                isSelected
                  ? 'bg-orange-500/15 border-orange-500/60 text-orange-200 shadow-sm shadow-orange-950/30'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
              }`}
            >
              <span className="text-sm select-none">{persona.avatar}</span>
              <span className="font-semibold">{persona.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                ({persona.accent.split('/')[0].trim()})
              </span>
              
              {isLiveSpeaking ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 font-mono animate-pulse">
                  <Activity className="w-3 h-3" />
                </span>
              ) : null}

              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handlePreview(e, persona)}
                title="Preview voice"
                className={`p-0.5 rounded hover:bg-white/10 transition ${
                  isPlaying ? 'text-amber-400 animate-pulse' : 'text-zinc-400 hover:text-white'
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
        <span className="text-[11px] text-zinc-400 font-medium">
          Calibrated speech synthesis & accent telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Interviewer Persona Options">
        {INTERVIEWER_PERSONAS.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          const isPlaying = playingId === persona.id;
          const isLiveSpeaking = isSelected && (activeVoiceStatus === 'speaking' || isPlaying);

          return (
            <div
              key={persona.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelect(persona)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(persona);
                }
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between gap-2.5 hud-pill ${
                isSelected
                  ? 'bg-orange-500/10 border-orange-500/60 shadow-lg shadow-orange-950/20 ring-1 ring-orange-500/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="text-2xl p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center shadow-inner">
                    {persona.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight">{persona.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono border border-zinc-700/50">
                        {persona.accent}
                      </span>
                    </div>
                    <p className="text-[11px] text-orange-400 font-medium">{persona.title}</p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="flex items-center gap-1.5">
                    {isLiveSpeaking ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-[10px] font-mono flex items-center gap-1 animate-pulse">
                        <Activity className="w-3 h-3" />
                        Speaking
                      </span>
                    ) : null}
                    <span className="p-1 rounded-full bg-orange-500/20 text-orange-400">
                      <Check className="w-4 h-4" />
                    </span>
                  </div>
                ) : null}
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                {persona.description}
              </p>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, persona)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    isPlaying
                      ? 'bg-orange-500 text-zinc-950 border-orange-400 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                  aria-label={isPlaying ? `Stop ${persona.name} preview` : `Preview ${persona.name} voice`}
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
