/**
 * Real-time Voice Acoustic Telemetry Engine
 * Analyzes audio buffer frames for pitch stability, vocal jitter,
 * speaking cadence (WPM), and filler word saturation.
 */

export const FILLER_DICTIONARY = [
  'um',
  'uh',
  'like',
  'you know',
  'actually',
  'basically',
  'literally',
  'sort of',
  'kind of',
  'i mean',
  'right',
];

/**
 * Calculates fundamental frequency (pitch in Hz) from raw audio PCM buffer via Autocorrelation.
 * @param {Float32Array} buffer - Time-domain audio sample buffer
 * @param {number} sampleRate - Audio context sample rate (e.g., 44100 or 48000)
 * @returns {{ pitchHz: number, rms: number, isVoiced: boolean }}
 */
export function computePitchAutocorrelation(buffer, sampleRate = 44100) {
  if (!buffer || buffer.length === 0) {
    return { pitchHz: 0, rms: 0, isVoiced: false };
  }

  // Calculate RMS (Root Mean Square) volume
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquares / buffer.length);

  // If signal is too quiet, treat as silence / unvoiced
  if (rms < 0.015) {
    return { pitchHz: 0, rms, isVoiced: false };
  }

  // Limit search range to realistic human vocal frequencies (75 Hz to 450 Hz)
  const minPeriod = Math.floor(sampleRate / 450);
  const maxPeriod = Math.floor(sampleRate / 75);

  let bestCorrelation = -1;
  let bestPeriod = -1;

  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0;
    const maxI = buffer.length - period;
    for (let i = 0; i < maxI; i++) {
      correlation += buffer[i] * buffer[i + period];
    }
    correlation = correlation / maxI;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestPeriod = period;
    }
  }

  if (bestPeriod > 0 && bestCorrelation > 0.005) {
    const pitchHz = Math.round(sampleRate / bestPeriod);
    return { pitchHz, rms, isVoiced: true };
  }

  return { pitchHz: 0, rms, isVoiced: false };
}

/**
 * Analyzes pitch variance, jitter, and inflection across a sliding window of pitch history.
 * @param {number[]} pitchHistory - Array of recent pitch values in Hz
 * @returns {{ averagePitchHz: number, stabilityScore: number, voiceSteadiness: string, jitterPercentage: number }}
 */
export function evaluatePitchStability(pitchHistory = []) {
  const voicedSamples = pitchHistory.filter((hz) => hz > 60 && hz < 500);

  if (voicedSamples.length < 3) {
    return {
      averagePitchHz: 130,
      stabilityScore: 80,
      voiceSteadiness: 'BALANCED',
      jitterPercentage: 1.2,
    };
  }

  const sum = voicedSamples.reduce((a, b) => a + b, 0);
  const avg = sum / voicedSamples.length;

  // Standard deviation
  const variance =
    voicedSamples.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
    voicedSamples.length;
  const stdDev = Math.sqrt(variance);

  // Cycle-to-cycle relative difference (jitter proxy)
  let diffSum = 0;
  for (let i = 1; i < voicedSamples.length; i++) {
    diffSum += Math.abs(voicedSamples[i] - voicedSamples[i - 1]);
  }
  const jitterPct = Math.min(
    10.0,
    Math.round(((diffSum / (voicedSamples.length - 1)) / avg) * 100 * 10) / 10
  );

  let steadiness = 'BALANCED';
  if (stdDev < 10) {
    steadiness = 'MONOTONIC';
  } else if (stdDev <= 30) {
    steadiness = 'BALANCED';
  } else if (stdDev <= 55) {
    steadiness = 'ENGAGING';
  } else {
    steadiness = 'VOLATILE';
  }

  // Stability score (100 = optimal controlled variance)
  let score = 100 - stdDev * 0.7 - jitterPct * 4;
  score = Math.max(25, Math.min(98, Math.round(score)));

  return {
    averagePitchHz: Math.round(avg),
    stabilityScore: score,
    voiceSteadiness: steadiness,
    jitterPercentage: jitterPct,
  };
}

/**
 * Computes words-per-minute pacing and assigns human-readable pacing tier.
 */
export function computeSpeechPacing(wordCount, durationSeconds) {
  if (!wordCount || wordCount <= 0 || !durationSeconds || durationSeconds <= 0) {
    return {
      wpm: 0,
      pacingTier: 'TOO_SLOW',
      isOptimal: false,
      advice: 'Start speaking to evaluate voice pacing.',
    };
  }

  const minutes = durationSeconds / 60;
  const wpm = Math.round(wordCount / minutes);

  let pacingTier = 'OPTIMAL';
  let isOptimal = true;
  let advice = 'Pacing is clear and balanced for conversational technical interviews.';

  if (wpm < 105) {
    pacingTier = 'TOO_SLOW';
    isOptimal = false;
    advice = 'Slightly slow delivery. Aim for 130-160 WPM to sustain high interviewer attention.';
  } else if (wpm < 125) {
    pacingTier = 'METHODICAL';
    isOptimal = true;
    advice = 'Deliberate, structured pacing. Ideal for complex system designs.';
  } else if (wpm <= 165) {
    pacingTier = 'OPTIMAL';
    isOptimal = true;
    advice = 'Golden zone! Natural cadence, engaging speed, and crisp articulation.';
  } else if (wpm <= 190) {
    pacingTier = 'ACCELERATED';
    isOptimal = false;
    advice = 'Slightly rushed. Pause at paragraph transitions to let technical points sink in.';
  } else {
    pacingTier = 'RUSHED';
    isOptimal = false;
    advice = 'High speech rate (>190 WPM) detected. Inhale and moderate your tempo.';
  }

  return { wpm, pacingTier, isOptimal, advice };
}

/**
 * Scans transcript for filler words and returns counts and timestamps.
 */
export function extractFillerCrutches(transcript = '') {
  if (!transcript || typeof transcript !== 'string') {
    return { totalFillers: 0, fillerBreakdown: {}, fillerDensityPct: 0 };
  }

  const text = transcript.toLowerCase();
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const totalWords = tokens.length;
  const breakdown = {};
  let totalFillers = 0;

  for (const filler of FILLER_DICTIONARY) {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      breakdown[filler] = matches.length;
      totalFillers += matches.length;
    }
  }

  const density = totalWords > 0 ? Math.round((totalFillers / totalWords) * 100 * 10) / 10 : 0;

  return {
    totalFillers,
    fillerBreakdown: breakdown,
    fillerDensityPct: density,
  };
}

/**
 * Calculates an overall vocal delivery score (0-100).
 */
export function computeVocalDeliveryScore({ wpm, stabilityScore, fillerDensityPct }) {
  let score = 85;

  // Pacing component
  if (wpm >= 125 && wpm <= 165) {
    score += 8;
  } else if (wpm >= 110 && wpm <= 185) {
    score += 3;
  } else if (wpm > 0) {
    score -= 10;
  }

  // Stability component
  if (stabilityScore >= 80) {
    score += 7;
  } else if (stabilityScore < 60) {
    score -= 10;
  }

  // Filler penalty
  if (fillerDensityPct > 5.0) {
    score -= 15;
  } else if (fillerDensityPct > 2.5) {
    score -= 7;
  }

  return Math.max(20, Math.min(99, Math.round(score)));
}
