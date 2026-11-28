export function combineAnswerParts(typedText, spokenText) {
  return [typedText, spokenText]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join('\n');
}

export function collectFinalizedResults(results, finalizedByIndex) {
  let interimTranscript = '';

  for (let index = 0; index < (results?.length || 0); index += 1) {
    const result = results[index];
    const transcript = result?.[0]?.transcript?.trim();
    if (!transcript) continue;

    if (result.isFinal) finalizedByIndex.set(index, transcript);
    else interimTranscript = `${interimTranscript} ${transcript}`.trim();
  }

  const finalizedTranscript = [...finalizedByIndex.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, transcript]) => transcript)
    .join(' ');

  return { finalizedTranscript, interimTranscript };
}

export function countTranscriptWords(text) {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
