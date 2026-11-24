# Cloud Health Observability & Incident Response Runbook

## 1. Overview & Architecture

The IntervAI cloud deployment incorporates a multi-tier observability framework designed to maintain zero-downtime availability and transparent status reporting across distributed cloud environments (Vercel, Render, Docker).

```
   [Candidate Browser]
           │
           ▼
[Vercel Edge Proxy /api/*]
           │
           ▼ (HTTPS reverse proxy)
[Render Cloud Container (Spring Boot)]
     ├── /api/v1/health/ping     (Lightweight <5ms uptime probe)
     ├── /api/v1/health          (Comprehensive telemetry)
     └── /api/auth/*             (Authentication & OTP delivery)
```

---

## 2. Telemetry Endpoints & Payload Contracts

### Ultra-Low Overhead Ping (`GET /api/v1/health/ping`)
Designed for load-balancer probes and high-frequency frontend pre-flight health checks:
```json
{
  "status": "UP",
  "timestamp": 1795535400000
}
```

### System Telemetry & Diagnostic Report (`GET /api/v1/health`)
Provides complete operational introspection into container resource utilization:
```json
{
  "status": "UP",
  "environment": "prod",
  "version": "2.0.0",
  "cloudProvider": "render",
  "uptimeSeconds": 1420,
  "jvmVersion": "21.0.2",
  "availableProcessors": 2,
  "threadCount": 28,
  "databaseLatencyMs": 4,
  "memory": {
    "totalMb": 256,
    "usedMb": 112,
    "freeMb": 144,
    "maxMb": 512,
    "usedPercentage": 44
  },
  "services": {
    "database": "UP",
    "mailService": "ACTIVE"
  },
  "features": {
    "geminiAiEnabled": true,
    "openAiEnabled": true,
    "codeExecutionEnabled": true
  }
}
```

---

## 3. Cloud Container Idle Sleep Patterns (Free Tier Runbook)

### Symptoms
- Frontend displays: `"Backend cloud container waking up..."`
- Initial request takes ~25–35 seconds before returning data.
- Subsequent requests execute in <150ms.

### Root Cause
Free-tier hosting providers (Render) transition inactive web services into suspended sleep state after 15 minutes of inactivity. When a candidate visits the portal, the ingress gateway initiates a container spin-up.

### Mitigation in IntervAI Architecture
1. **Frontend Pre-Flight Banner (`CloudConnectivityBanner.jsx`)**: Proactively monitors server availability with non-blocking polls and displays transparent feedback instead of abrupt failure screens.
2. **Extended Axios Timeouts (`client.js`)**: All production HTTP clients enforce a 45-second timeout budget to accommodate cold start spin-ups.
3. **Keep-Alive Uptime Pings**: Evaluators or uptime monitors can hit `/api/v1/health/ping` every 10 minutes to prevent automatic sleep suspension.
