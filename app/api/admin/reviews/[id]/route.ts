import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { logInfo } from "@/lib/logger"

const updateSchema = z.object({
  action: z.enum(["approve", "reject", "delete"]),
  adminNotes: z.string().optional()
})

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json()
    const { action, adminNotes } = updateSchema.parse(body)

    let updateData: any = {}

    switch (action) {
      case "approve":
        updateData = { isApproved: true }
        logInfo("Review approved", { reviewId: params.id })
        break
      case "reject":
        updateData = { isApproved: false }
        logInfo("Review rejected", { reviewId: params.id })
        break
      case "delete":
        await prisma.review.update({
          where: { id: params.id },
          data: { deletedAt: new Date() }
        })
        logInfo("Review deleted", { reviewId: params.id })
        return createApiResponse({ data: { ok: true }, status: 200 })
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true } }
      }
    })

    return createApiResponse({ data: updated, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const review = await prisma.review.findUnique({ 
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, images: true } }
      }
    })
    
    if (!review) return createApiResponse({ status: 404, error: "Review not found" })
    
    return createApiResponse({ data: review, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
