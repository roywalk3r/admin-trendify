# Incident Response Plan

This plan outlines how to detect, triage, communicate, mitigate, and retrospect incidents in production.

## 1. Detection
- **Error Tracking:** Sentry captures unhandled exceptions and performance anomalies.
- **Logs:** Pino structured logs shipped to your aggregator (Datadog/ELK).
- **Alerts:** Configure Sentry alert rules for new issues, error rate spikes, and regression.

## 2. Triage
- **Severity Levels:**
  - SEV1: Outage or checkout broken
  - SEV2: Major feature degraded (auth, cart)
  - SEV3: Minor bug, workarounds exist
- **On-call:** Assign one engineer per week; ensure rotations and contact methods.

## 3. Communication
- **Internal:** #incidents Slack channel, pin ongoing status and owner.
- **External (if needed):** Status page update, pinned banner, email for SEV1.

## 4. Mitigation & Rollback
- **Immediate Actions:**
  - Roll back to last known good deployment.
  - Feature flag problematic modules.
  - Temporarily disable non-critical background jobs.
- **Data Safety:**
  - Verify database integrity; restore from backups if corruption occurred.

## 5. Root Cause Analysis (RCA)
- **Template:**
  - Summary, Timeline, Impact, Root cause, Contributing factors, Fix, Prevention.
- **Timeline:** Complete within 48 hours post-incident.

## 6. Prevention
- Add or refine tests (unit, integration, E2E).
- Add SLO/SLIs and alerts (latency p95 < 200ms, error rate < 0.1%).
- Improve dashboards (APM, DB metrics, queue depth).

## 7. Playbooks
- **High error rates:** Check Sentry; redeploy; scale; rate limit abusive endpoints.
- **Checkout failures:** Validate payment gateway status; failover; notify support.
- **DB load spikes:** Enable read replicas/pooling; add/adjust indexes; cache hot queries.
- **Redis issues:** Circuit-breaker to fail open for non-critical paths.

## 8. Ownership
- Keep owners per subsystem: Auth, Checkout, Catalog, Admin, Infra.

## 9. Tools
- Sentry, Datadog/New Relic, Grafana/Prometheus, Cloud provider logs, Vercel analytics.
