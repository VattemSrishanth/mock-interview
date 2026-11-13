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
    pitch: 0.88,
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
    pitch: 1.15,
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
    pitch: 0.95,
    rate: 1.00,
    avatar: '👨‍💻'
  }
];

const FEMALE_KEYWORDS = [
  'zira', 'jenny', 'aria', 'samantha', 'victoria', 'hazel', 'susan', 'sonia',
  'libby', 'amber', 'michelle', 'karen', 'serena', 'kate', 'neerja', 'ananya',
  'clara', 'natasha', 'chloe', 'heera', 'linda', 'catherine', 'ana', 'ashley',
  'cora', 'elizabeth', 'monica', 'maisie', 'mia', 'stephanie', 'joanna', 'kendra',
  'kimberly', 'salli', 'ivy', 'eva', 'ava', 'emma', 'olivia', 'sophia', 'female',
  'woman', 'girl', 'lady', 'google us english', 'google uk english female'
];

const MALE_KEYWORDS = [
  'david', 'mark', 'guy', 'george', 'ryan', 'daniel', 'alex', 'richard',
  'fred', 'ravi', 'davis', 'eric', 'christopher', 'oliver', 'roger', 'steffan',
  'alfie', 'thomas', 'william', 'ken', 'prabhat', 'madhur', 'liam', 'sean',
  'paul', 'brian', 'matthew', 'justin', 'joey', 'russell', 'michael', 'male',
  'man', 'boy', 'google uk english male'
];

export function classifyVoice(voice) {
  if (!voice) return { gender: 'unknown', isUk: false, isUs: false, isEnglish: false, voice: null };

  const name = (voice.name || '').toLowerCase();
  const lang = (voice.lang || '').toLowerCase().replace('_', '-');
  const uri = (voice.voiceURI || '').toLowerCase();
  const combined = `${name} ${lang} ${uri}`;

  const isEnglish = lang.startsWith('en') || combined.includes('english');
  const isUk = lang.startsWith('en-gb') || lang.startsWith('en-uk') || combined.includes('british') || combined.includes('united kingdom') || combined.includes('uk english');
  const isUs = lang.startsWith('en-us') || combined.includes('united states') || combined.includes('us english');

  const isFemale = FEMALE_KEYWORDS.some((kw) => {
    if (kw === 'female') return combined.includes('female');
    if (kw === 'woman') return combined.includes('woman');
    return combined.includes(kw);
  });

  const isMale = !isFemale && MALE_KEYWORDS.some((kw) => {
    if (kw === 'male') return /\bmale\b/i.test(combined);
    if (kw === 'man') return /\bman\b/i.test(combined);
    return combined.includes(kw);
  });

  const gender = isFemale ? 'female' : (isMale ? 'male' : 'unknown');
  return { gender, isUk, isUs, isEnglish, voice };
}

export function resolveDedicatedVoices(voices) {
  if (!voices || !voices.length) {
    return { sarah: null, james: null, elena: null, alex: null };
  }

  let candidates = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('en') || (v.name || '').toLowerCase().includes('english');
  });
  if (!candidates.length) candidates = voices;

  const classified = candidates.map(classifyVoice);
  const femalePool = classified.filter((c) => c.gender === 'female');
  const malePool = classified.filter((c) => c.gender === 'male');

  // 1. Sarah (US Female Tech Lead)
  const sarahOrder = ['jenny', 'aria', 'samantha', 'google us english', 'zira', 'linda', 'catherine', 'amber', 'michelle'];
  let sarahMatch = null;
  for (const kw of sarahOrder) {
    sarahMatch = femalePool.find((c) => c.voice.name.toLowerCase().includes(kw));
    if (sarahMatch) break;
  }
  if (!sarahMatch && femalePool.length) sarahMatch = femalePool[0];
  const sarahVoice = sarahMatch ? sarahMatch.voice : (candidates[0] || null);

  // 2. Elena (US Female VP of Eng) - distinct from Sarah when multiple females exist
  const elenaOrder = ['aria', 'amber', 'michelle', 'victoria', 'serena', 'hazel', 'susan', 'sonia', 'tessa', 'jenny', 'samantha', 'zira'];
  let elenaMatch = null;
  const distinctFemales = femalePool.filter((c) => c.voice !== sarahVoice);
  if (distinctFemales.length) {
    for (const kw of elenaOrder) {
      elenaMatch = distinctFemales.find((c) => c.voice.name.toLowerCase().includes(kw));
      if (elenaMatch) break;
    }
    if (!elenaMatch) elenaMatch = distinctFemales[0];
  } else if (femalePool.length) {
    elenaMatch = femalePool[0];
  }
  const elenaVoice = elenaMatch ? elenaMatch.voice : (candidates[0] || null);

  // 3. Alex (US Male Principal)
  const alexOrder = ['guy', 'davis', 'david', 'alex', 'eric', 'christopher', 'fred', 'mark'];
  let alexMatch = null;
  for (const kw of alexOrder) {
    alexMatch = malePool.find((c) => c.voice.name.toLowerCase().includes(kw));
    if (alexMatch) break;
  }
  if (!alexMatch && malePool.length) alexMatch = malePool[0];
  const alexVoice = alexMatch ? alexMatch.voice : (candidates[0] || null);

  // 4. James (UK Male Staff Architect) - prefer UK male, or secondary male distinct from Alex
  const jamesOrder = ['ryan', 'george', 'daniel', 'oliver', 'alfie', 'google uk english male', 'richard', 'ravi'];
  let jamesMatch = null;
  const ukMales = malePool.filter((c) => c.isUk);
  if (ukMales.length) {
    for (const kw of jamesOrder) {
      jamesMatch = ukMales.find((c) => c.voice.name.toLowerCase().includes(kw));
      if (jamesMatch) break;
    }
    if (!jamesMatch) jamesMatch = ukMales[0];
  } else {
    const anyUk = classified.filter((c) => c.isUk);
    if (anyUk.length) {
      jamesMatch = anyUk[0];
    } else {
      const distinctMales = malePool.filter((c) => c.voice !== alexVoice);
      jamesMatch = distinctMales.length ? distinctMales[0] : (malePool[0] || null);
    }
  }
  const jamesVoice = jamesMatch ? jamesMatch.voice : (candidates[0] || null);

  return {
    sarah: sarahVoice,
    james: jamesVoice,
    elena: elenaVoice,
    alex: alexVoice
  };
}

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
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.availableVoices = voices;
        }
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

  getAudioConfigForPersona(persona) {
    if (!persona) return { voice: null, pitch: 1.0, rate: 1.0 };
    const p = INTERVIEWER_PERSONAS.find((item) => item.id === (persona.id || persona)) || persona;

    if (!this.availableVoices || !this.availableVoices.length) {
      this.initVoices();
    }
    if ((!this.availableVoices || !this.availableVoices.length) && typeof window !== 'undefined' && window.speechSynthesis?.getVoices) {
      try {
        const directVoices = window.speechSynthesis.getVoices();
        if (directVoices && directVoices.length) {
          this.availableVoices = directVoices;
        }
      } catch {}
    }

    const dedicatedMap = resolveDedicatedVoices(this.availableVoices);
    const assignedVoice = dedicatedMap[p.id] || null;

    let pitch = p.pitch ?? 1.0;
    let rate = p.rate ?? 1.0;

    // Acoustic differentiation if personas must share the same system voice
    if (p.id === 'elena' && dedicatedMap.sarah && assignedVoice && dedicatedMap.sarah === assignedVoice) {
      pitch = 1.18;
      rate = Math.max(rate, 1.02);
    } else if (p.id === 'james') {
      const isUk = assignedVoice && classifyVoice(assignedVoice).isUk;
      const sharesWithAlex = dedicatedMap.alex && assignedVoice && dedicatedMap.alex === assignedVoice;
      if (!isUk || sharesWithAlex) {
        pitch = 0.84;
        rate = Math.min(rate, 0.90);
      }
    }

    return {
      voice: assignedVoice,
      pitch,
      rate
    };
  }

  matchBrowserVoiceForPersona(persona) {
    return this.getAudioConfigForPersona(persona).voice;
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
      const audioConfig = this.getAudioConfigForPersona(persona);

      utterance.pitch = audioConfig.pitch;
      utterance.rate = audioConfig.rate;
      if (audioConfig.voice) {
        utterance.voice = audioConfig.voice;
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
}

export const voiceInterviewerService = new VoiceInterviewerService();
