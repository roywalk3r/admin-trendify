import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { paystackInitialize } from "@/lib/paystack"

const bodySchema = z.object({
  amount: z.coerce.number().positive(), // in major unit (e.g., NGN)
  email: z.string().email(),
  // Ignore client-provided currency to avoid merchant mismatch; server decides
  currency: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { amount, email, metadata } = parsed.data

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"
    if (!secretKey) return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not set" }, { status: 500 })

    // Decide currency on server based on merchant setup. Prefer env.
    const serverCurrency = (process.env.PAYSTACK_CURRENCY || process.env.NEXT_PUBLIC_CURRENCY || "NGN").toUpperCase()
    // Optionally limit channels via env (comma-separated). If unset, let Paystack decide.
    const channelsEnv = process.env.PAYSTACK_CHANNELS
    const channels = channelsEnv
      ? channelsEnv.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined

    const reference = `TREND-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const initPayload: any = {
      email,
      amount: Math.round(amount * 100), // kobo
      currency: serverCurrency,
      reference,
      callback_url: `${publicUrl}/checkout/confirm`,
      metadata: {
        ...metadata,
        userId,
        reference,
      },
    }
    if (channels && channels.length > 0) {
      initPayload.channels = channels
    }

    const init = await paystackInitialize(secretKey, initPayload)

    if (!init.status || !init.data) {
      return NextResponse.json({ error: init.message || "Failed to initialize payment" }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        authorization_url: init.data.authorization_url,
        reference: init.data.reference,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}
