# Deployment & Cloud Container Runbook

## Zero-Downtime Initialization
- **CORS Resiliency**: `CorsConfig` is configured to never fail application context bootstrap on misconfigured environment variables.
- **DNS Lookup Resilience**: Mail exchange validation safely degrades on container network isolation, permitting genuine user onboarding.
