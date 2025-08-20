import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { paystackVerify } from "@/lib/paystack"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    // Allow verification view even if not signed-in (coming from Paystack redirect), but prefer signed in
    const url = new URL(req.url)
    const reference = url.searchParams.get("reference")

    if (!reference) return NextResponse.json({ error: "reference is required" }, { status: 400 })

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not set" }, { status: 500 })

    const res = await paystackVerify(secretKey, reference)

    if (!res.status || !res.data) {
      return NextResponse.json({ error: res.message || "Verification failed" }, { status: 400 })
    }

    // Here you would: create an Order, persist payment details, clear server cart, etc.
    // For now, just return the Paystack payload
    return NextResponse.json({ data: res.data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}
