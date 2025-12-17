import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { normalizeCacheTags } from "@/lib/prisma-accelerate"

export async function GET() {
  const users = await prisma.user.findMany({
    cacheStrategy: {
      ttl: 60, // Cache for 60 seconds
      tags: normalizeCacheTags(["users_list"]),
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
  const accelerator = (prisma as any)?.$accelerate
  if (accelerator?.invalidate) {
    await accelerator.invalidate({ tags: normalizeCacheTags(["users_list"]) }).catch(() => {})
  }

  return NextResponse.json(user, { status: 201 })
}
