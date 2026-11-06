/**
 * Utility functions for exporting interview session results to downloadable files (JSON/Markdown)
 */

export function exportInterviewReportJson(result, readinessTier = null) {
  if (!result) return;

  const exportPayload = {
    exportDate: new Date().toISOString(),
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

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const roleSlug = (result.jobRole || 'interview').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = url;
  link.download = `intervai-report-${roleSlug}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
