# Trendify - Immediate Fixes Required Before Production

**Priority:** 🔴 CRITICAL - Must complete before deployment  
**Timeline:** Week 1 (5-7 days)  
**Status:** Action Required

---

## Overview

This document outlines **critical fixes** that must be implemented before deploying Trendify to production. These issues pose security risks, performance problems, or will cause failures in production environments.

---

## 1. Remove Test/Debug Code (30 minutes)

### Files to DELETE

```bash
# Execute these commands immediately
rm -f app/test/page.tsx
rm -f app/api/test/route.ts
git add -A
git commit -m "Remove test files before production deployment"
```

### Why This Matters

**`/app/test/page.tsx`:**
- Contains hardcoded external URL: `https://devchop.pagekite.me`
- Exposes internal authentication tokens
- Has broken TypeScript (mixing client/server code incorrectly)
- Security vulnerability if exposed

**`/app/api/test/route.ts`:**
- Uses deprecated Next.js Pages API format
- Hardcoded localhost URLs
- No production value

### Verification

```bash
# Ensure no other files reference these
grep -r "devchop.pagekite" app/ lib/ components/
grep -r "/test/page" app/ lib/ components/
```

---

## 2. Consolidate Duplicate Appwrite Files (2-3 hours)

### Current Mess

```
lib/
├── appwirte-utils.ts        ❌ TYPO in filename
├── appwrite-client.ts       ❌ Duplicate
├── appwrite.ts              ❌ Duplicate
└── appwrite/
    ├── appwirte-utils.ts    ❌ Duplicate with typo
    ├── appwrite-utils.ts    ⚠️  Correct spelling but duplicate
    ├── appwrite-client.ts   ❌ Duplicate
    ├── appwrite.ts          ❌ Duplicate
    └── utils.ts             ⚠️  Another version
```

**5 different files with overlapping functionality!**

### Solution

**Step 1: Audit files**
```bash
# Check what each file exports
cat lib/appwirte-utils.ts | grep "export"
cat lib/appwrite/appwrite-utils.ts | grep "export"
cat lib/appwrite/utils.ts | grep "export"
```

**Step 2: Consolidate into canonical structure**

Keep only these 3 files:
```
lib/appwrite/
├── client.ts     # Appwrite client initialization
├── storage.ts    # File upload/download functions
└── utils.ts      # Helper functions
```

**Step 3: Update all imports**
```bash
# Find all imports
grep -r "from.*appwrite" app/ components/ lib/ --include="*.ts" --include="*.tsx"

# Example replacements:
# import { uploadFile } from "@/lib/appwirte-utils"
# → import { uploadFile } from "@/lib/appwrite/storage"
```

**Step 4: Delete old files**
```bash
rm lib/appwirte-utils.ts
rm lib/appwrite-client.ts
rm lib/appwrite.ts
rm lib/appwrite/appwirte-utils.ts
rm lib/appwrite/appwrite-client.ts
rm lib/appwrite/appwrite.ts
```

---

## 3. Fix Rate Limiting to Use Redis (1-2 hours)

### Current Problem

**File:** `/lib/api-utils.ts` (lines 72-100)

```typescript
// ❌ BROKEN: In-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>()

export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  // ... in-memory implementation
}
```

**Why This Fails:**
- ❌ **Serverless**: Each Lambda has separate memory
- ❌ **Multi-instance**: Won't work across multiple servers  
- ❌ **Memory leaks**: Map never gets cleaned up
- ❌ **Restarts**: Rate limits reset on deployment

### Solution

You already have Redis rate limiting in `/lib/redis.ts`. Use it!

**File:** `/lib/api-utils.ts`

```typescript
// ❌ DELETE lines 72-100 (old Map implementation)

// ✅ ADD THIS
import { rateLimit as redisRateLimit } from './redis'

/**
 * Check if request should be rate limited using Redis
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum requests allowed
 * @param windowInSeconds - Time window in seconds
 * @returns true if rate limited, false if allowed
 */
export async function checkRateLimit(
  identifier: string, 
  limit: number, 
  windowInSeconds: number = 60
): Promise<boolean> {
  const result = await redisRateLimit(identifier, limit, windowInSeconds)
  return !result.success // Return true if rate limited
}
```

**Update ALL usages** (function is now async):

**File:** `/app/api/products/route.ts` (line 149)
```typescript
// ❌ OLD (synchronous)
if (checkRateLimit(`${clientIp}:product-create`, 5, 60000)) {
  return createApiResponse({
    error: "Too many requests. Please try again later.",
    status: 429,
  })
}

// ✅ NEW (async, uses seconds not milliseconds)
const isRateLimited = await checkRateLimit(`${clientIp}:product-create`, 5, 60)
if (isRateLimited) {
  return createApiResponse({
    error: "Too many requests. Please try again later.",
    status: 429,
  })
}
```

**Find ALL usages:**
```bash
grep -r "checkRateLimit" app/api/ lib/
```

### Testing

```bash
# Test rate limiting works
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{}' \
  # Repeat 6 times - 6th should return 429
```

---

## 4. Set Up Error Tracking with Sentry (1 hour)

### Install Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configure Sentry

**File:** `sentry.client.config.ts` (created by wizard)
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // 100% in dev
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
  
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") return null
    return event
  },
})
```

**File:** `sentry.server.config.ts` (created by wizard)
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% sampling to save costs
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
})
```

### Update Error Handling

**File:** `/lib/api-utils.ts`
```typescript
import * as Sentry from "@sentry/nextjs"

export function handleApiError(error: unknown): NextResponse {
  // ✅ ADD: Log to Sentry
  Sentry.captureException(error, {
    level: "error",
    tags: {
      component: "api",
    },
  })
  
  console.error("API Error:", error)
  
  // ... rest of error handling
}
```

### Environment Variables

Add to `.env`:
```bash
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
SENTRY_AUTH_TOKEN="xxxxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="trendify"
```

Get these from: https://sentry.io → Create Project → Settings → Client Keys

---

## 5. Add Structured Logging (2 hours)

### Install Pino

```bash
npm install pino pino-pretty
```

### Create Logger

**File:** `/lib/logger.ts` (NEW)
```typescript
import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Redact sensitive data
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'email',
      'token',
      'apiKey',
      '*.password',
      '*.token',
    ],
    remove: true,
  },
})

// Helper functions for common use cases
export const logError = (error: unknown, context?: Record<string, any>) => {
  logger.error({ err: error, ...context }, 'Error occurred')
}

export const logInfo = (message: string, data?: Record<string, any>) => {
  logger.info(data, message)
}

export const logWarn = (message: string, data?: Record<string, any>) => {
  logger.warn(data, message)
}

export const logDebug = (message: string, data?: Record<string, any>) => {
  logger.debug(data, message)
}

// Request logger
export const logRequest = (req: Request, duration?: number) => {
  logger.info({
    method: req.method,
    url: req.url,
    duration,
  }, 'HTTP Request')
}
```

### Replace Console Statements

**Bad:**
```typescript
console.log("API Error:", error)
console.log("Cache hit:", key)
console.error("Failed to send email:", err)
```

**Good:**
```typescript
import { logger, logError, logInfo } from "@/lib/logger"

logError(error, { context: "API endpoint" })
logInfo("Cache hit", { key })
logError(err, { context: "Email sending" })
```

### Find and Replace

```bash
# Find all console usage
grep -r "console\." app/ lib/ components/ --include="*.ts" --include="*.tsx" | wc -l

# Files to update
grep -r "console\." app/api/ --include="*.ts" -l
```

**Priority files to update:**
1. `/lib/api-utils.ts`
2. `/lib/redis.ts`
3. All files in `/app/api/`

---

## 6. Fix CORS Configuration (Already Done ✅)

**Status:** ✅ Fixed

The previous report mentioned CORS was set to `*`, but checking `/next.config.ts` line 82, it's now correctly set to:

```typescript
value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
```

**Verification for production:**
Ensure `NEXT_PUBLIC_APP_URL` is set correctly in production environment variables.

---

## 7. Enable TypeScript Strict Mode (30 minutes)

### Update tsconfig.json

**File:** `/tsconfig.json`
```json
{
  "compilerOptions": {
    "strict": true,              // ✅ Enable
    "noImplicitAny": true,       // ✅ Enable  
    "strictNullChecks": true,    // ✅ Enable
    "strictFunctionTypes": true, // ✅ Enable
    "noUnusedLocals": true,      // ⚠️ Warning only
    "noUnusedParameters": true,  // ⚠️ Warning only
    // ... rest of config
  }
}
```

### Fix Type Errors

```bash
# Run type check
npm run build

# Fix errors one by one
# Common fixes:
# - Replace `any` with proper types
# - Add null checks
# - Fix implicit returns
```

**Target:** Zero TypeScript errors before production

---

## 8. Security Headers Verification (10 minutes)

**Status:** ✅ Implemented

Headers are correctly configured in `/next.config.ts`. Verify they're working:

```bash
# Test security headers
curl -I http://localhost:3000 | grep -E "X-Frame-Options|X-Content-Type|Strict-Transport"
```

**Expected output:**
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## 9. Environment Variables Audit (30 minutes)

### Check for Secrets in Code

```bash
# Audit for hardcoded secrets
grep -r "sk_" app/ lib/ components/
grep -r "pk_test" app/ lib/ components/
grep -r "api_key" app/ lib/ components/
grep -r "secret" app/ lib/ components/ -i
```

### Verify .gitignore

**File:** `.gitignore`
```
.env
.env.local
.env*.local
.env.production
```

### Check Git History

```bash
# Ensure no secrets were ever committed
git log --all --full-history -p -- .env
git log -p | grep -E "DATABASE_URL|SECRET_KEY|API_KEY" -i
```

If secrets found:
```bash
# Use git-filter-repo or BFG to remove
```

---

## 10. Database Connection Pooling (1 hour)

### Current Issue

Default Prisma Client may exhaust connections in serverless.

### Solution

**File:** `/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

### Add Connection Pooling

For production, use PgBouncer or Prisma Accelerate:

**Option 1: PgBouncer (self-hosted)**
```bash
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/db?pgbouncer=true"
```

**Option 2: Prisma Accelerate (managed)**
```bash
npm install @prisma/extension-accelerate
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=xxxxx"
```

---

## Checklist Before Production

- [ ] Test files removed (`app/test/`, `app/api/test/`)
- [ ] Appwrite files consolidated (only 3 files in `/lib/appwrite/`)
- [ ] Rate limiting uses Redis (async function)
- [ ] Sentry installed and configured
- [ ] Pino logger implemented in critical files
- [ ] TypeScript strict mode enabled
- [ ] No `any` types in API routes
- [ ] Security headers verified
- [ ] No secrets in code or git history
- [ ] `.env` file properly gitignored
- [ ] Database connection pooling configured
- [ ] All console.log replaced with logger in `/app/api/`

---

## Timeline

| Task | Estimated Time | Priority |
|------|----------------|----------|
| Remove test files | 30 min | P0 |
| Consolidate Appwrite files | 3 hours | P0 |
| Fix rate limiting | 2 hours | P0 |
| Setup Sentry | 1 hour | P0 |
| Add structured logging | 2 hours | P1 |
| TypeScript strict mode | 1 hour | P1 |
| Audit secrets | 30 min | P0 |
| Connection pooling | 1 hour | P1 |

**Total:** ~11 hours (1.5 work days)

---

## Next Steps

After completing these fixes, proceed to:
1. **FEATURE_IMPLEMENTATION.md** - Essential e-commerce features
2. **TESTING_STRATEGY.md** - Test infrastructure
3. **DEPLOYMENT_GUIDE.md** - Production deployment

---

**Document Updated:** October 21, 2025  
**Last Review:** Pre-production audit
