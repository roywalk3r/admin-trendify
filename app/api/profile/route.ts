import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { z } from "zod"
import prisma from "@/lib/prisma"

const updateSchema = z.object({
  name: z.string().min(2).max(100),
  avatar: z.string().url().optional().or(z.literal("")),
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Find or create a local user record using Clerk userId as local id
    let user = await prisma.user.findFirst({ where: { id: userId } })
    const cu = await currentUser()
    if (!user) {
      if (!cu) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      const primaryEmail = cu.primaryEmailAddress?.emailAddress || cu.emailAddresses?.[0]?.emailAddress
      const displayName = cu.firstName && cu.lastName ? `${cu.firstName} ${cu.lastName}` : cu.username || primaryEmail || "User"
      const avatarUrl = cu.imageUrl || undefined
      // If we cannot determine an email, fail (email is required in schema)
      if (!primaryEmail) return NextResponse.json({ error: "No email on Clerk user" }, { status: 400 })

      user = await prisma.user.create({
        data: {
          id: userId,
          email: primaryEmail,
          name: displayName,
          avatar: avatarUrl,
          role: "customer",
          isVerified: (cu.primaryEmailAddress as any)?.verification?.status === "verified" || false,
          lastLoginAt: new Date(),
        },
      })
    }

    // Fetch recent orders for this user
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { payment: true, orderItems: true },
    })

    return NextResponse.json({ data: { user, orders } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const json = await req.json()
    const parsed = updateSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { name, avatar } = parsed.data

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatar: avatar || null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}
