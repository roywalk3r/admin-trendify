import { NextRequest, NextResponse } from "next/server"
import { detectAbandonedCarts } from "@/lib/jobs/abandoned-cart-recovery"
import { logInfo, logError } from "@/lib/logger"

/**
 * Cron endpoint for abandoned cart detection
 * Configure in vercel.json to run hourly
 * 
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    logError(new Error("CRON_SECRET not configured"), { context: "Cron job" })
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    logError(new Error("Unauthorized cron access attempt"), { 
      context: "Cron job",
      ip: req.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    logInfo("Starting abandoned cart recovery job")

    const result = await detectAbandonedCarts()

    logInfo("Abandoned cart recovery job completed", result)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error) {
    logError(error, { context: "Abandoned cart cron job" })
    
    return NextResponse.json(
      {
        success: false,
        error: "Job failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggering (with same auth)
export async function POST(req: NextRequest) {
  return GET(req)
}
