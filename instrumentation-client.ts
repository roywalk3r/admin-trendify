// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production"
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (isProd && DSN) {
  Sentry.init({
    dsn: DSN,
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: 1,
    enableLogs: false,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: true,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;