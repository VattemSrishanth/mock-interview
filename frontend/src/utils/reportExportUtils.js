/**
 * Utility functions for exporting interview session results to downloadable files (JSON/Markdown)
 */

export function buildReportFilename(jobRole, extension = 'json', dateSlug = new Date().toISOString().slice(0, 10)) {
  const prefix = extension === 'md' ? 'intervai-scorecard' : 'intervai-report';
  const roleSlug = (jobRole || 'interview')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'interview';
  return `${prefix}-${roleSlug}-${dateSlug}.${extension}`;
}

/**
 * Safely formats a numerical score into a clamped percentage string.
 * @param {number|string|null|undefined} score
 * @returns {string} Formatted score like "85%" or "N/A"
 */
export function formatReportScore(score) {
  if (score == null || score === '') return 'N/A';
  const num = Number(score);
  if (Number.isNaN(num)) return 'N/A';
  const clamped = Math.max(0, Math.min(100, Math.round(num)));
  return `${clamped}%`;
}

export function buildInterviewReportPayload(result, readinessTier = null, exportDate = new Date().toISOString()) {
  if (!result) return null;

  return {
    exportDate,
    session: {
      id: result.id,
      jobRole: result.jobRole || 'Technical Interview',
      interviewType: result.interviewType || 'General',
      difficulty: result.difficulty || 'Standard',
      overallScore: result.overallScore != null ? result.overallScore : null,
      readinessTier: readinessTier?.label || null,
      evaluationSource: result.evaluationSource || 'Not recorded'
    },
    competencyScores: {
      technicalKnowledge: result.technicalKnowledgeScore ?? null,
      communication: result.communicationScore ?? null,
      relevance: result.relevanceScore ?? null,
      clarity: result.clarityScore ?? null,
      confidence: result.confidenceScore ?? null
    },
    observations: {
      strengths: result.strengths || [],
      areasToDevelop: result.weaknesses || result.improvements || [],
      recommendations: result.recommendations || result.suggestions || []
    },
    questions: (result.questions || []).map((q, idx) => ({
      index: idx + 1,
      question: q.questionText,
      candidateAnswer: q.userAnswer || q.candidateAnswer || '',
      expectedModelAnswer: q.modelAnswer || q.expectedKeyPoints || '',
      score: q.feedback?.score ?? null,
      feedback: q.feedback?.strengths || q.feedback?.suggestions || []
    }))
  };
}

export function buildInterviewReportMarkdown(
  result,
  readinessTier = null,
  dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
) {
  if (!result) return '';

  const role = result.jobRole || 'Technical Interview';
  const score = formatReportScore(result.overallScore);
  const tier = readinessTier?.label || 'Completed';

  const lines = [
    `# IntervAI Performance Scorecard — ${role}`,
    ``,
    `> **Assessment Date**: ${dateStr}  `,
    `> **Overall Score**: ${score}  `,
    `> **Readiness Tier**: ${tier}  `,
    `> **Track & Level**: ${result.interviewType || 'General'} · ${result.difficulty || 'Standard'}  `,
    `> **Evaluation Mode**: ${result.evaluationSource || 'Standard'}`,
    ``,
    `---`,
    ``,
    `## 📊 Competency Rubric Scores`,
    ``,
    `| Competency Dimension | Score | Scale |`,
    `| :--- | :---: | :---: |`,
    `| Technical Knowledge | ${result.technicalKnowledgeScore ?? '—'} | / 100 |`,
    `| Communication & Articulation | ${result.communicationScore ?? '—'} | / 100 |`,
    `| Relevance & Focus | ${result.relevanceScore ?? '—'} | / 100 |`,
    `| Clarity & Structure | ${result.clarityScore ?? '—'} | / 100 |`,
    `| Confidence & Poise | ${result.confidenceScore ?? '—'} | / 100 |`,
    ``
  ];

  const strengths = result.strengths || [];
  if (strengths.length > 0) {
    lines.push(`## 🌟 Observed Strengths`, ``);
    strengths.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push(``);
  }

  const areas = result.weaknesses || result.improvements || [];
  if (areas.length > 0) {
    lines.push(`## 🎯 Areas for Development`, ``);
    areas.forEach((a) => lines.push(`- ${a}`));
    lines.push(``);
  }

  const recs = result.recommendations || result.suggestions || [];
  if (recs.length > 0) {
    lines.push(`## 💡 Recommended Next Practice`, ``);
    recs.forEach((r) => lines.push(`- ${r}`));
    lines.push(``);
  }

  const questions = result.questions || [];
  if (questions.length > 0) {
    lines.push(`---`, ``, `## 📝 Question-by-Question Transcript & AI Feedback`, ``);
    questions.forEach((q, idx) => {
      const fb = q.feedback || {};
      const qScore = fb.score != null ? `${fb.score}/100` : 'Guidance Only';
      lines.push(`### Question ${idx + 1}: ${q.questionText || 'Question'}`);
      lines.push(`- **Score**: ${qScore}`);
      lines.push(``);
      lines.push(`#### Candidate Response:`);
      lines.push(q.userAnswer || q.candidateAnswer ? `> ${q.userAnswer || q.candidateAnswer}` : `*No response recorded.*`);
      lines.push(``);
      if (q.modelAnswer || q.expectedKeyPoints) {
        lines.push(`#### Expected Concepts / Reference Model:`);
        lines.push(`> ${q.modelAnswer || q.expectedKeyPoints}`);
        lines.push(``);
      }
      const notes = [...(fb.strengths || []), ...(fb.suggestions || [])];
      if (notes.length > 0) {
        lines.push(`#### AI Coaching Observations:`);
        notes.forEach((n) => lines.push(`- ${n}`));
        lines.push(``);
      }
      lines.push(`---`, ``);
    });
  }

  lines.push(`*Generated via IntervAI AI-Powered Mock Interview Platform.*`);
  return lines.join('\n');
}

export function exportInterviewReportJson(result, readinessTier = null) {
  const exportPayload = buildInterviewReportPayload(result, readinessTier);
  if (!exportPayload) return;

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildReportFilename(result.jobRole, 'json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInterviewReportMarkdown(result, readinessTier = null) {
  const mdContent = buildInterviewReportMarkdown(result, readinessTier);
  if (!mdContent) return;

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildReportFilename(result.jobRole, 'md');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
