import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { logInfo, logError } from "@/lib/logger"
import { Receiver } from "@upstash/qstash"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function releaseExpiredReservations() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes

  const orders = await prisma.order.findMany({
    where: {
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: { lte: cutoff },
    },
    select: {
      id: true,
      orderNumber: true,
      orderItems: { select: { productId: true, variantId: true, quantity: true } },
    },
    take: 200,
  })

  let released = 0

  for (const order of orders) {
    await prisma.$transaction(async (tx) => {
      // Re-check inside txn to avoid race with webhook
      const fresh = await tx.order.findUnique({
        where: { id: order.id },
        select: { status: true, paymentStatus: true },
      })

      if (!fresh || fresh.status !== "pending" || fresh.paymentStatus !== "unpaid") return

      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: "canceled" },
      })

      await tx.payment.updateMany({
        where: { orderId: order.id, status: "unpaid" },
        data: { status: "failed", failedAt: new Date(), failureReason: "Reservation expired" },
      })

      await tx.audit.create({
        data: {
          userId: null,
          userEmail: null,
          action: "RESERVATION_EXPIRED",
          entityType: "order",
          entityId: order.id,
          oldValue: { status: "pending", paymentStatus: "unpaid" },
          newValue: { status: "canceled", paymentStatus: "failed" },
        },
      })

      released++
    })
  }

  return { scanned: orders.length, released }
}

export async function GET(req: NextRequest) {
  const devToken = process.env.CRON_SECRET
  if (process.env.NODE_ENV !== "production") {
    const token = req.headers.get("x-cron-token")
    if (devToken && token !== devToken) {
      return NextResponse.json({ error: "Unauthorized (dev)" }, { status: 401 })
    }

    try {
      logInfo("[DEV] Starting release-stock job (GET)")
      const result = await releaseExpiredReservations()
      logInfo("[DEV] release-stock job completed", result)
      return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() })
    } catch (error) {
      logError(error, { context: "release-stock cron job (GET dev)" })
      return NextResponse.json({ success: false, error: "Job failed" }, { status: 500 })
    }
  }

  return NextResponse.json({ health: "ok" }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production"

  if (isProd) {
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY

    if (!currentSigningKey || !nextSigningKey) {
      logError(new Error("QStash signing keys not configured"), { context: "Cron job" })
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const receiver = new Receiver({ currentSigningKey, nextSigningKey })

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
    const proto = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https")
    const url = `${proto}://${host}/api/cron/release-stock`

    const signature = req.headers.get("Upstash-Signature") || req.headers.get("upstash-signature") || ""
    const body = await req.text()

    const isValid = await receiver.verify({ signature, body, url })
    if (!isValid) {
      logError(new Error("Invalid QStash signature"), { context: "Cron job" })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      logInfo("Starting release-stock job (QStash)")
      const result = await releaseExpiredReservations()
      logInfo("release-stock job completed (QStash)", result)
      return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() })
    } catch (error) {
      logError(error, { context: "release-stock cron job (QStash)" })
      return NextResponse.json({ success: false, error: "Job failed" }, { status: 500 })
    }
  }

  const token = req.headers.get("x-cron-token")
  const devToken = process.env.CRON_SECRET
  if (devToken && token !== devToken) {
    return NextResponse.json({ error: "Unauthorized (dev)" }, { status: 401 })
  }

  try {
    logInfo("[DEV] Starting release-stock job (POST)")
    const result = await releaseExpiredReservations()
    logInfo("[DEV] release-stock job completed (POST)", result)
    return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() })
  } catch (error) {
    logError(error, { context: "release-stock cron job (POST dev)" })
    return NextResponse.json({ success: false, error: "Job failed" }, { status: 500 })
  }
}
