import prisma from "@/lib/prisma"

type PaymentOutcome = "paid" | "failed" | "abandoned" | "unknown"

export type FinalizeOrderPaymentInput = {
  orderId: string
  provider: "paystack"
  reference: string
  outcome: PaymentOutcome
  currency: string
  paidAmountMinor?: number
  gatewayFeeMinor?: number
  paidAt?: Date
  failureReason?: string
  verifyPayload?: any
}

export async function finalizeOrderPayment(input: FinalizeOrderPaymentInput) {
  const {
    orderId,
    provider,
    reference,
    outcome,
    currency,
    paidAmountMinor,
    gatewayFeeMinor,
    paidAt,
    failureReason,
    verifyPayload,
  } = input

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, email: true } },
      orderItems: { select: { id: true, productId: true, variantId: true, quantity: true } },
      payment: true,
    },
  })

  if (!order) {
    return { ok: false as const, status: 404 as const, error: "Order not found" }
  }

  // Ensure payment row exists
  const payment = await prisma.payment.upsert({
    where: { orderId },
    update: {},
    create: {
      orderId,
      amount: order.totalAmount,
      currency,
      method: provider,
      status: "unpaid",
    },
  })

  // Idempotency: if payment already finalized, do nothing
  if (payment.status === "paid" || payment.status === "failed" || payment.status === "refunded" || payment.status === "partially_refunded") {
    return { ok: true as const, status: 200 as const, orderId: order.id, paymentStatus: payment.status, orderPaymentStatus: order.paymentStatus }
  }

  const orderAmountMinor = Math.round(Number(order.totalAmount) * 100)

  // Decide state transitions
  if (outcome === "paid") {
    if (typeof paidAmountMinor === "number" && paidAmountMinor < orderAmountMinor) {
      return { ok: false as const, status: 400 as const, error: "Paid amount is less than order amount" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          transactionId: reference,
          currency,
          gatewayFee: gatewayFeeMinor != null ? Number(gatewayFeeMinor) / 100 : undefined,
          paidAt: paidAt || new Date(),
          metadata: {
            ...(payment.metadata as object),
            verify: verifyPayload,
          },
        },
      })

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
          status: order.status === "pending" ? "processing" : order.status,
        },
      })

      await tx.audit.create({
        data: {
          userId: null,
          userEmail: order.user?.email || null,
          action: "PAYMENT_PAID",
          entityType: "order",
          entityId: order.id,
          oldValue: { paymentStatus: order.paymentStatus, status: order.status },
          newValue: { paymentStatus: "paid", status: order.status === "pending" ? "processing" : order.status },
        },
      })
    })

    return { ok: true as const, status: 200 as const, orderId: order.id }
  }

  if (outcome === "failed" || outcome === "abandoned") {
    // Restore reserved stock (order creation decremented stock)
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "failed",
          failedAt: new Date(),
          failureReason: failureReason || (outcome === "abandoned" ? "Payment abandoned" : "Payment failed"),
          transactionId: reference,
          currency,
          metadata: {
            ...(payment.metadata as object),
            verify: verifyPayload,
          },
        },
      })

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "failed",
          status: order.status === "pending" ? "canceled" : order.status,
        },
      })

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

      await tx.audit.create({
        data: {
          userId: null,
          userEmail: order.user?.email || null,
          action: "PAYMENT_FAILED",
          entityType: "order",
          entityId: order.id,
          oldValue: { paymentStatus: order.paymentStatus },
          newValue: { paymentStatus: "failed" },
        },
      })
    })

    return { ok: true as const, status: 200 as const, orderId: order.id }
  }

  // Unknown outcome: store metadata only
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      transactionId: reference,
      currency,
      metadata: {
        ...(payment.metadata as object),
        verify: verifyPayload,
      },
    },
  })

  return { ok: true as const, status: 200 as const, orderId: order.id }
}
