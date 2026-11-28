# Bounded AI Rate-Limiter Specification

## Overview
`AiRateLimiter` enforces fixed-window request ceilings per user (`app.ai.rate-limit.max-requests`, default `10` requests per `60` seconds) while bounding memory to `maxTrackedUsers` (`10000`).

## Introspection APIs
- **`remainingQuota(long userId)`**: Returns available quota for the active window (or `maxRequests` if no active non-expired window exists) without consuming a token.
- **`getTrackedUserCount()`**: Evicts expired user windows and returns the count of active tracked users.
