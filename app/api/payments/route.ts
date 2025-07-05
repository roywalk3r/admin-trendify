import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { userId, redirectToSignIn } = await auth()

  if (!userId) return redirectToSignIn()
  const { orderId, paymentMethod, transactionId } = await req.json()

  const payment = await prisma.payment.create({
    data: {
      orderId,
      paymentMethod,
      paymentStatus: "COMPLETED",
      transactionId,
    },
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  })

  return NextResponse.json(payment, { status: 201 })
}
