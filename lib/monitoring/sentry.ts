// Optional Sentry integration that won't break builds if @sentry/nextjs isn't installed
// Usage: import { captureException, captureMessage, initSentry } from '@/lib/monitoring/sentry'

import { logError, logWarn } from "@/lib/logger"

let sentryLoaded = false as boolean
let sentry: any = null

export async function initSentry() {
  if (sentryLoaded) return
  if (!process.env.SENTRY_DSN) return
  try {
    // Dynamically import to avoid hard dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    sentry = require("@sentry/nextjs")
    sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
      replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE || 0),
      replaysOnErrorSampleRate: Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || 1),
      environment: process.env.NODE_ENV,
      enabled: true,
    })
    sentryLoaded = true
  } catch (e) {
    logWarn("Sentry not installed; monitoring disabled", {})
  }
}

export function captureException(err: unknown, context?: Record<string, any>) {
  if (sentryLoaded && sentry) {
    try {
      sentry.captureException(err, { extra: context })
      return
    } catch {}
  }
  // Fallback to structured log
  logError(err, { context: "captureException", ...context })
}

export function captureMessage(message: string, context?: Record<string, any>) {
  if (sentryLoaded && sentry) {
    try {
      sentry.captureMessage(message, { extra: context })
      return
    } catch {}
  }
  logWarn(message, context)
}
