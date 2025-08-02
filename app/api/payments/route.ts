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
      paymentStatus: "paid",
      transactionId,
      amount: 0,
      order: { connect: { id: orderId } },
    },
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "paid" },
  })

  return NextResponse.json(payment, { status: 201 })
}
