import api from '../api/client.js';

export const INTERVIEWER_PERSONAS = [
  {
    id: 'sarah',
    name: 'Sarah',
    title: 'Senior Tech Lead',
    accent: 'US / American',
    gender: 'Female',
    description: 'Conversational, clear, and structured technical interviewer.',
    previewText: "Hello! I am Sarah, your technical interviewer. Let's explore your problem-solving process.",
    cloudVoice: 'nova',
    pitch: 1.0,
    rate: 0.95,
    avatar: '👩‍💻'
  },
  {
    id: 'james',
    name: 'James',
    title: 'Staff Architect',
    accent: 'UK / British',
    gender: 'Male',
    description: 'Analytical, rigorous, probing deep system trade-offs and edge cases.',
    previewText: "Good day. I am James. We'll be walking through systems architecture and algorithmic resilience.",
    cloudVoice: 'onyx',
    pitch: 0.95,
    rate: 0.92,
    avatar: '👨‍💼'
  },
  {
    id: 'elena',
    name: 'Elena',
    title: 'VP of Engineering',
    accent: 'US / American',
    gender: 'Female',
    description: 'Strategic and encouraging, focusing on leadership, architecture, and team outcomes.',
    previewText: "Welcome! I am Elena. I am excited to discuss how you structure complex applications and collaborate.",
    cloudVoice: 'shimmer',
    pitch: 1.05,
    rate: 0.98,
    avatar: '👩‍🏫'
  },
  {
    id: 'alex',
    name: 'Alex',
    title: 'Distributed Systems Principal',
    accent: 'US / American',
    gender: 'Male',
    description: 'Direct, pragmatic, and focused on production reliability and performance.',
    previewText: "Hi there, I am Alex. Let's dive right into implementation details, concurrency, and telemetry.",
    cloudVoice: 'echo',
    pitch: 0.90,
    rate: 1.00,
    avatar: '👨‍💻'
  }
];

let currentAudio = null;
let keepAliveTimer = null;

class VoiceInterviewerService {
  constructor() {
    this.selectedPersonaId = (typeof localStorage !== 'undefined' && localStorage?.getItem?.('intervai_persona_id')) || 'sarah';
    this.availableVoices = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.speechSynthesis?.getVoices === 'function') {
      this.initVoices();
      try {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      } catch {}
    }
  }

  initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.speechSynthesis?.getVoices === 'function') {
      try {
        this.availableVoices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.availableVoices = [];
      }
    }
  }

  getPersonas() {
    return INTERVIEWER_PERSONAS;
  }

  getSelectedPersona() {
    const found = INTERVIEWER_PERSONAS.find((p) => p.id === this.selectedPersonaId);
    return found || INTERVIEWER_PERSONAS[0];
  }

  setSelectedPersona(personaId) {
    this.selectedPersonaId = personaId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('intervai_persona_id', personaId);
    }
  }

  stopSpeaking() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {}
      currentAudio = null;
    }
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.speechSynthesis?.cancel === 'function') {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  async speak(text, { personaId = this.selectedPersonaId, onStart, onEnd, onError } = {}) {
    this.stopSpeaking();
    if (!text || typeof text !== 'string') return;

    const persona = INTERVIEWER_PERSONAS.find((p) => p.id === personaId) || this.getSelectedPersona();

    // 1. Attempt Cloud TTS via backend first
    try {
      const response = await api.post(
        '/tts/synthesize',
        {
          text,
          persona: persona.id,
          voice: persona.cloudVoice,
          speed: persona.rate
        },
        { responseType: 'blob' }
      );

      if (response.data && response.data.type === 'audio/mpeg' && typeof Audio !== 'undefined') {
        const audioUrl = URL.createObjectURL(response.data);
        const audio = new Audio(audioUrl);
        currentAudio = audio;

        audio.onplay = () => onStart?.();
        audio.onended = () => {
          onEnd?.();
          try { URL.revokeObjectURL(audioUrl); } catch {}
          currentAudio = null;
        };
        audio.onerror = () => {
          try { URL.revokeObjectURL(audioUrl); } catch {}
          currentAudio = null;
          this.speakViaEnhancedBrowser(text, persona, { onStart, onEnd, onError });
        };

        await audio.play();
        return;
      }
    } catch {
      // Cloud TTS unavailable or returned fallback status; proceed to browser engine
    }

    // 2. Enhanced Browser Natural Persona Speech
    this.speakViaEnhancedBrowser(text, persona, { onStart, onEnd, onError });
  }

  speakViaEnhancedBrowser(text, persona, { onStart, onEnd, onError } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof window.speechSynthesis?.speak !== 'function' || typeof SpeechSynthesisUtterance === 'undefined') {
      onError?.(new Error('Speech synthesis not supported in this environment'));
      return;
    }

    try {
      if (typeof window.speechSynthesis.cancel === 'function') {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = persona.pitch;
      utterance.rate = persona.rate;

      const voice = this.matchBrowserVoiceForPersona(persona);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        onStart?.();
        // Chrome 15s freeze workaround
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        keepAliveTimer = setInterval(() => {
          if (window.speechSynthesis?.speaking) {
            try {
              window.speechSynthesis.pause?.();
              window.speechSynthesis.resume?.();
            } catch {}
          } else {
            clearInterval(keepAliveTimer);
          }
        }, 10000);
      };

      utterance.onend = () => {
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        onEnd?.();
      };

      utterance.onerror = (e) => {
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        onEnd?.();
        onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      onError?.(e);
    }
  }

  matchBrowserVoiceForPersona(persona) {
    if (!this.availableVoices.length) {
      this.initVoices();
    }
    const voices = this.availableVoices;
    if (!voices.length) return null;

    if (persona.id === 'james') {
      // UK Male
      const ukVoice = voices.find((v) => 
        (v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB')) &&
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('ryan'))
      );
      if (ukVoice) return ukVoice;
      const anyUk = voices.find((v) => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'));
      if (anyUk) return anyUk;
    } else if (persona.gender === 'Female') {
      // US Female
      const femaleUs = voices.find((v) =>
        (v.lang.startsWith('en-US') || v.lang.startsWith('en_US') || v.lang === 'en') &&
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('jenny') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('female'))
      );
      if (femaleUs) return femaleUs;
    } else {
      // US Male
      const maleUs = voices.find((v) =>
        (v.lang.startsWith('en-US') || v.lang.startsWith('en_US') || v.lang === 'en') &&
        (v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male'))
      );
      if (maleUs) return maleUs;
    }

    // Default to any English voice
    return voices.find((v) => v.lang.startsWith('en')) || voices[0];
  }
}

export const voiceInterviewerService = new VoiceInterviewerService();
