# Database Backup Strategy

A practical, automated backup and restore plan for Trendify's PostgreSQL database.

## Objectives
- **RPO (Recovery Point Objective):** <= 24 hours (daily backups)
- **RTO (Recovery Time Objective):** <= 1 hour
- **Retention:** 7 daily, 4 weekly, 3 monthly snapshots

## Backup Types
- **Logical backups:** `pg_dump` (portable, slower restore) — good for schema migrations and portability.
- **Physical backups:** Managed provider snapshots (faster) — recommended in production.

## Daily Automated Backups (cron)

Example GitHub Actions (self-hosted/runner with DB access) or any cron on a secure VM.

```bash
#!/usr/bin/env bash
set -euo pipefail

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BUCKET="s3://your-bucket/trendify-db-backups"
DUMP_FILE="trendify_${DATE}.sql.gz"

# Ensure DATABASE_URL is set: postgresql://user:pass@host:5432/db
pg_dump "$DATABASE_URL" | gzip > "/tmp/${DUMP_FILE}"

# Upload to S3 (or any storage)
aws s3 cp "/tmp/${DUMP_FILE}" "$BUCKET/daily/${DUMP_FILE}" --sse AES256

# Cleanup local
rm -f "/tmp/${DUMP_FILE}"
```

- Run daily at 01:00 UTC.
- Promote one daily to weekly every Sunday, and one weekly to monthly on the 1st.

## Restore Procedure (Logical dump)

```bash
# 1) Create a new empty database (or drop & recreate in dev)
createdb trendify_restore

# 2) Restore
gunzip -c trendify_2025-10-21_01-00-00.sql.gz | psql $DATABASE_URL_RESTORE
```

## Verification
- After restore, run:
  - `npx prisma migrate status`
  - `npx prisma generate`
  - Application smoke tests

## Security
- Store backups encrypted at rest (SSE on S3 or KMS-managed).
- Restrict access to the backup bucket (least privilege IAM role).
- Rotate credentials regularly.

## Monitoring
- Emit metrics/logs when backup completes/fails.
- Alert on missing backup > 24 hours.

## Notes for Managed DBs
- If using managed PostgreSQL (Supabase, RDS, Neon, etc.), enable their automated snapshots and set retention.
- Keep logical `pg_dump` in addition to snapshots for portability.
