import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const id = params.id
    const body = await req.json()
    const { fullName, street, city, state, zipCode, country, phone, isDefault } = body || {}

    const exists = await prisma.address.findFirst({ where: { id, userId: user.id } })
    if (!exists) return NextResponse.json({ error: "Address not found" }, { status: 404 })

    const updated = await prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } })
      }
      return tx.address.update({
        where: { id },
        data: {
          fullName: fullName ?? exists.fullName,
          street: street ?? exists.street,
          city: city ?? exists.city,
          state: state ?? exists.state,
          zipCode: zipCode ?? exists.zipCode,
          country: country ?? exists.country,
          phone: phone ?? exists.phone,
          isDefault: isDefault ?? exists.isDefault,
        },
      })
    })

    return NextResponse.json({ data: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const id = params.id
    const exists = await prisma.address.findFirst({ where: { id, userId: user.id } })
    if (!exists) return NextResponse.json({ error: "Address not found" }, { status: 404 })

    await prisma.address.delete({ where: { id } })
    return NextResponse.json({ data: { ok: true } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 })
  }
}
