import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the current user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update user roles" }, { status: 403 })
    }

    const { id } = params
    const { role } = await request.json()

    // Validate role
    const validRoles = ["admin", "staff", "customer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Update user role
    await prisma.user.update({
      where: { id },
      data: { role },
    })

    // Return 204 No Content for successful updates without response body
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
