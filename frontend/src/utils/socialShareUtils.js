/**
 * Utilities for generating formatted viral social share messages for LinkedIn, WhatsApp, and Twitter/X
 */

export function buildSocialShareCopy({
  jobRole = 'Software Engineer',
  overallScore = 85,
  shareUrl = '',
  interviewType = 'Technical'
}) {
  const scoreNum = Number(overallScore) || 0;
  const emoji = scoreNum >= 85 ? '🏆' : scoreNum >= 70 ? '🎯' : '🚀';
  
  const headline = `${emoji} Just completed a rigorous ${interviewType} Mock Interview for ${jobRole} on IntervAI!`;
  const scoreText = scoreNum > 0 ? `Scored ${scoreNum}% on the AI Evaluated Technical Competency Rubric.` : 'Evaluated with real-time speech telemetry and STAR answer analysis.';
  const cta = `Check out my verified assessment report and technical feedback:`;

  const fullText = `${headline}\n\n${scoreText}\n${cta}\n${shareUrl}\n\n#IntervAI #TechInterview #CareerGrowth #${jobRole.replace(/[^a-zA-Z0-9]/g, '')}`;

  return {
    headline,
    scoreText,
    cta,
    fullText,
    encodedText: encodeURIComponent(fullText),
    encodedUrl: encodeURIComponent(shareUrl)
  };
}

export function openLinkedInShare({ shareUrl, jobRole, overallScore }) {
  const { encodedUrl } = buildSocialShareCopy({ shareUrl, jobRole, overallScore });
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openWhatsAppShare({ shareUrl, jobRole, overallScore, interviewType }) {
  const { encodedText } = buildSocialShareCopy({ shareUrl, jobRole, overallScore, interviewType });
  const url = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openTwitterShare({ shareUrl, jobRole, overallScore }) {
  const { headline, encodedUrl } = buildSocialShareCopy({ shareUrl, jobRole, overallScore });
  const tweetText = encodeURIComponent(`${headline} Verified report:`);
  const url = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
