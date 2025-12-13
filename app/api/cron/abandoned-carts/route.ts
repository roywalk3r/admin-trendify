import { NextRequest, NextResponse } from "next/server"
import { detectAbandonedCarts } from "@/lib/jobs/abandoned-cart-recovery"
import { logInfo, logError } from "@/lib/logger"
import { Receiver } from "@upstash/qstash"

/**
 * Cron endpoint for abandoned cart detection
 * Configure in vercel.json to run hourly
 * 
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */
export async function GET(req: NextRequest) {
  // Health check or manual trigger in development with a simple token
  const devToken = process.env.CRON_SECRET
  if (process.env.NODE_ENV !== "production") {
    const token = req.headers.get("x-cron-token")
    if (devToken && token !== devToken) {
      return NextResponse.json({ error: "Unauthorized (dev)" }, { status: 401 })
    }
    try {
      logInfo("[DEV] Starting abandoned cart recovery job (GET)")
      const result = await detectAbandonedCarts()
      logInfo("[DEV] Abandoned cart recovery job completed", result)
      return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() })
    } catch (error) {
      logError(error, { context: "Abandoned cart cron job (GET dev)" })
      return NextResponse.json({ success: false, error: "Job failed" }, { status: 500 })
    }
  }
  // In production, just expose a health response; QStash will call POST
  return NextResponse.json({ health: "ok" }, { status: 200 })
}

// Also allow POST for manual triggering (with same auth)
export async function POST(req: NextRequest) {
  // In production, verify QStash signature; in dev, allow optional token
  const isProd = process.env.NODE_ENV === "production"

  if (isProd) {
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY

    if (!currentSigningKey || !nextSigningKey) {
      logError(new Error("QStash signing keys not configured"), { context: "Cron job" })
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const receiver = new Receiver({ currentSigningKey, nextSigningKey })

    // Build absolute URL of this endpoint for verification
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
    const proto = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https")
    const url = `${proto}://${host}/api/cron/abandoned-carts`

    const signature = req.headers.get("Upstash-Signature") || req.headers.get("upstash-signature") || ""
    const body = await req.text()

    const isValid = await receiver.verify({ signature, body, url })
    if (!isValid) {
      logError(new Error("Invalid QStash signature"), { context: "Cron job" })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      logInfo("Starting abandoned cart recovery job (QStash)")
      const result = await detectAbandonedCarts()
      logInfo("Abandoned cart recovery job completed (QStash)", result)
      return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() })
    } catch (error) {
      logError(error, { context: "Abandoned cart cron job (QStash)" })
      return NextResponse.json({ success: false, error: "Job failed" }, { status: 500 })
    }
  } else {
    // Development: allow manual POST with x-cron-token
    const token = req.headers.get("x-cron-token")
    const devToken = process.env.CRON_SECRET
    if (devToken && token !== devToken) {
      return NextResponse.json({ error: "Unauthorized (dev)" }, { status: 401 })
    }
    try {
      logInfo("[DEV] Starting abandoned cart recovery job (POST)")
      const result = await detectAbandonedCarts()
      logInfo("[DEV] Abandoned cart recovery job completed (POST)", result)
      return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() })
    } catch (error) {
      logError(error, { context: "Abandoned cart cron job (POST dev)" })
      return NextResponse.json({ success: false, error: "Job failed" }, { status: 500 })
    }
  }
}
