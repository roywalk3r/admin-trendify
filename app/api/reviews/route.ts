import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export async function POST(req: Request) {
  const { userId, redirectToSignIn } = await auth()
  if (!userId) {
    if (!userId) return redirectToSignIn()
  }

  const body = await req.json()
  const parsed = reviewSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 })
  }

  const { productId, rating, comment } = parsed.data

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
