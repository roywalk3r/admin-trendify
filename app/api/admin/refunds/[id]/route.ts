import { NextRequest } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { logInfo } from "@/lib/logger"

const updateSchema = z.object({
  action: z.enum(["approve", "reject", "complete"]),
  notes: z.string().optional()
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json()
    const { action } = updateSchema.parse(body)

    let newStatus: "pending" | "approved" | "completed" | "rejected" = "pending"

    switch (action) {
      case "approve":
        newStatus = "approved"
        break
      case "reject":
        newStatus = "rejected"
        break
      case "complete":
        newStatus = "completed"
        // TODO: Process actual refund via payment gateway
        break
    }

    const updated = await prisma.refund.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            user: { select: { email: true } }
          }
        }
      }
    })

    logInfo(`Refund ${action}`, { refundId: params.id, status: newStatus })

    // TODO: Send email notification to customer

    return createApiResponse({ data: updated, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
