import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"

// GET: list addresses for current user
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ status: 401, error: "Unauthorized" })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return createApiResponse({ status: 404, error: "User not found" })

    const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } })
    return createApiResponse({ status: 200, data: addresses })
  } catch (e: any) {
    return handleApiError(e)
  }
}

// POST: create address for current user
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return createApiResponse({ status: 401, error: "Unauthorized" })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return createApiResponse({ status: 404, error: "User not found" })

    const body = await req.json()
    const { fullName, street, city, state, zipCode, country, phone, isDefault } = body || {}

    if (!fullName || !street || !city || !state || !zipCode || !country || !phone) {
      return createApiResponse({ status: 400, error: "Missing required fields" })
    }

    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } })
      }
      return tx.address.create({
        data: { userId: user.id, fullName, street, city, state, zipCode, country, phone, isDefault: !!isDefault },
      })
    })

    return createApiResponse({ status: 201, data: created })
  } catch (e: any) {
    return handleApiError(e)
  }
}
