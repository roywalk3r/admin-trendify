import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const users = await prisma.user.findMany({
    cacheStrategy: {
      ttl: 60, // Cache for 60 seconds
    },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const { userId, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn()

  const { name, email } = await req.json()

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    create: { clerkId: userId, name, email },
    update: { name, email },
  })

  return NextResponse.json(user, { status: 201 })
}
