# Email Verification & Pre-flight Availability Specification

## Overview
This specification details the candidate registration verification flow, ensuring resilience against DNS network isolation and accurate status feedback.

### Endpoints
- `GET /api/auth/check-email?email={email}`: Real-time availability check returning `{ "available": boolean, "message": string }`
- `POST /api/auth/send-verification-code`: Dispatches a 6-digit OTP to genuine candidate inboxes.
