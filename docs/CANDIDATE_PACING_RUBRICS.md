# Candidate Response Pacing Rubrics & Timing Intelligence

## 1. Objective

Effective technical and behavioral interviewing balances **depth of explanation** against **concise delivery**. Rambling beyond 3 minutes dilutes key architectural points, while sub-60-second responses often omit concrete trade-offs and edge cases.

IntervAI's shared pacing engine (`pacingUtils.js` + `InterviewTimerBadge.jsx`) standardizes response time coaching across live voice and text sessions.

---

## 2. Three-Stage Response Pacing Model

| Window (Default 180s) | Stage Token | Visual Indicator | Behavioral & Technical Guidance |
|---|---|---|---|
| `00:00 – 00:59` | `INTRODUCTORY` | Slate badge, brand bar | Frame the thesis, clarify constraints, and state high-level approach. |
| `01:00 – 02:59` | `OPTIMAL` | Amber badge, amber bar | Present core implementation details, Big-O complexity, or STAR actions. |
| `03:00+` | `WRAP_UP` | Rose badge, full bar | Summarize concrete outcome/metrics and invite interviewer follow-up. |

---

## 3. Adaptive Readiness & Weakest-Dimension Ranking

Complementing real-time response timers, post-session evaluation (`peerBenchmarkUtils.js` & `AnalyticsService.java`) diagnoses candidate balance across five dimensions:

1. **Technical Knowledge** (`technicalKnowledgeScore`)
2. **Communication** (`communicationScore`)
3. **Problem Relevance** (`relevanceScore`)
4. **STAR Structure / Clarity** (`clarityScore`)
5. **Vocal Cadence & Poise** (`confidenceScore`)

Candidates receive prioritized practice actions ordered automatically by lowest score, paired with a global `readinessGrade` (`CALIBRATING`, `FOUNDATIONAL`, `COMPETITIVE`, `PLACEMENT_READY`).
