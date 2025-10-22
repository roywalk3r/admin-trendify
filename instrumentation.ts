import { initSentry } from "@/lib/monitoring/sentry"

export async function register() {
  try {
    await initSentry()
  } catch {
    // Sentry not installed or DSN missing; ignore
  }
}
