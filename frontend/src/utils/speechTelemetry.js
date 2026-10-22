/**
 * Speech & Communication Telemetry Analyzer
 * Computes live and post-answer delivery analytics:
 * - Filler word density & breakdown
 * - Speaking pace (Words Per Minute / WPM)
 * - Articulation & pacing status alerts
 */

export const FILLER_WORDS = [
  'you know',
  'sort of',
  'kind of',
  'i mean',
  'at the end of the day',
  'to be honest',
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'basically',
  'actually',
  'literally',
  'honestly',
  'right'
];

/**
 * Analyzes raw text / speech transcript and duration to produce delivery telemetry.
 *
 * @param {string} text - The spoken or combined answer transcript
 * @param {number} durationSeconds - Elapsed time spent answering in seconds
 * @returns {object} Speech telemetry analysis
 */
export function analyzeSpeechTelemetry(text = '', durationSeconds = 0) {
  if (!text || typeof text !== 'string') {
    return {
      totalWords: 0,
      durationSeconds: Math.max(0, Math.round(durationSeconds)),
      wordsPerMinute: 0,
      pacingStatus: 'STANDBY',
      pacingLabel: 'Standby / Waiting for speech',
      pacingColor: 'slate',
      fillerCount: 0,
      fillerPercentage: 0,
      fillerBreakdown: {},
      fillerStatus: 'CLEAN',
      fillerLabel: 'No filler words detected',
      fillerColor: 'emerald',
      tips: ['Start speaking or typing to measure delivery cadence.']
    };
  }

  const cleanText = text.trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  // Multi-word and single-word filler detection
  const lowerText = ` ${cleanText.toLowerCase().replace(/[.,!?;:()"]/g, ' ')} `;
  const fillerBreakdown = {};
  let totalFillers = 0;

  // 1. Multi-word phrases first
  const multiWordFillers = FILLER_WORDS.filter((f) => f.includes(' '));
  const singleWordFillers = FILLER_WORDS.filter((f) => !f.includes(' '));

  let workingText = lowerText;
  for (const phrase of multiWordFillers) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s+${escaped}\\s+`, 'g');
    const matches = workingText.match(regex);
    if (matches && matches.length > 0) {
      fillerBreakdown[phrase] = matches.length;
      totalFillers += matches.length;
      // remove matched phrase so individual words aren't double-counted
      workingText = workingText.replace(regex, ' ');
    }
  }

  // 2. Single word fillers
  const remainingTokens = workingText.split(/\s+/).filter(Boolean);
  for (const token of remainingTokens) {
    if (singleWordFillers.includes(token)) {
      fillerBreakdown[token] = (fillerBreakdown[token] || 0) + 1;
      totalFillers += 1;
    }
  }

  const duration = Math.max(1, Math.round(durationSeconds));
  const wordsPerMinute = totalWords > 0 && duration > 0 
    ? Math.round((totalWords / duration) * 60) 
    : 0;

  const fillerPercentage = totalWords > 0 
    ? Number(((totalFillers / totalWords) * 100).toFixed(1)) 
    : 0;

  // Pacing evaluation
  let pacingStatus = 'OPTIMAL';
  let pacingLabel = 'Optimal Cadence (130-165 WPM)';
  let pacingColor = 'emerald';

  if (totalWords < 5) {
    pacingStatus = 'STANDBY';
    pacingLabel = 'Calibrating pace…';
    pacingColor = 'slate';
  } else if (wordsPerMinute < 105) {
    pacingStatus = 'SLOW';
    pacingLabel = `Hesitant Pacing (${wordsPerMinute} WPM)`;
    pacingColor = 'amber';
  } else if (wordsPerMinute < 130) {
    pacingStatus = 'DELIBERATE';
    pacingLabel = `Deliberate & Measured (${wordsPerMinute} WPM)`;
    pacingColor = 'emerald';
  } else if (wordsPerMinute <= 165) {
    pacingStatus = 'OPTIMAL';
    pacingLabel = `Optimal Cadence (${wordsPerMinute} WPM)`;
    pacingColor = 'emerald';
  } else if (wordsPerMinute <= 190) {
    pacingStatus = 'FAST';
    pacingLabel = `Brisk Delivery (${wordsPerMinute} WPM)`;
    pacingColor = 'amber';
  } else {
    pacingStatus = 'RUSHED';
    pacingLabel = `Too Rushed / Nervous (${wordsPerMinute} WPM)`;
    pacingColor = 'rose';
  }

  // Filler status evaluation
  let fillerStatus = 'EXCELLENT';
  let fillerLabel = 'Crisp & Articulate';
  let fillerColor = 'emerald';

  if (totalFillers === 0) {
    fillerStatus = 'EXCELLENT';
    fillerLabel = '0% Fillers · Crisp Delivery';
    fillerColor = 'emerald';
  } else if (fillerPercentage <= 3.5) {
    fillerStatus = 'GOOD';
    fillerLabel = `${fillerPercentage}% Fillers · Natural`;
    fillerColor = 'emerald';
  } else if (fillerPercentage <= 7.0) {
    fillerStatus = 'MODERATE';
    fillerLabel = `${fillerPercentage}% Fillers · Noticeable`;
    fillerColor = 'amber';
  } else {
    fillerStatus = 'HIGH';
    fillerLabel = `${fillerPercentage}% Fillers · Excessive`;
    fillerColor = 'rose';
  }

  // Contextual communication tips
  const tips = [];
  if (pacingStatus === 'RUSHED') {
    tips.push('Pacing is elevated (>190 WPM). Pause briefly after explaining core concepts to let the interviewer absorb the key points.');
  } else if (pacingStatus === 'SLOW') {
    tips.push('Pacing is under 105 WPM. Structure your thoughts ahead with bullet points or the STAR method to maintain momentum.');
  }

  if (fillerStatus === 'HIGH' || fillerStatus === 'MODERATE') {
    const topFillers = Object.entries(fillerBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([word, cnt]) => `"${word}" (${cnt}×)`)
      .slice(0, 3)
      .join(', ');
    tips.push(`Frequent filler usage detected: ${topFillers}. Replace verbal fillers with a silent 1-second pause when formulating ideas.`);
  }

  if (tips.length === 0 && totalWords > 10) {
    tips.push('Strong delivery! Clear cadence with well-controlled verbal mannerisms.');
  }

  return {
    totalWords,
    durationSeconds: duration,
    wordsPerMinute,
    pacingStatus,
    pacingLabel,
    pacingColor,
    fillerCount: totalFillers,
    fillerPercentage,
    fillerBreakdown,
    fillerStatus,
    fillerLabel,
    fillerColor,
    tips
  };
}

