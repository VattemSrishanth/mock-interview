# Social Scorecard Sharing & URL Sanitization Spec

## Overview
`socialShareUtils.js` formats interview completion badges and verified scorecard URLs for LinkedIn, WhatsApp, and Twitter/X while normalizing empty or whitespace role inputs.

## Key Contracts
- **`buildSocialShareCopy({ jobRole, overallScore, shareUrl, interviewType })`**:
  - Sanitizes `jobRole` whitespace to `"Software Engineer"` and hashtag `#Engineering` fallback.
  - Safely normalizes missing `shareUrl` to an empty string prior to `encodeURIComponent`.
  - Selects performance tier icons (`🏆` >= 85, `🎯` >= 70, `🚀` < 70).
