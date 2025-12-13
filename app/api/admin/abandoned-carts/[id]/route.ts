import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { sendAbandonedCartEmail } from "@/lib/email"

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json().catch(() => ({} as any))
    const action = (body as any)?.action as string | undefined

    if (action !== "remind") {
      return createApiResponse({ error: "Invalid action", status: 400 })
    }

    const cart = await prisma.abandonedCart.findUnique({ where: { id: params.id } })

    if (!cart) {
      return createApiResponse({ error: "Abandoned cart not found", status: 404 })
    }

    if (!cart.email) {
      return createApiResponse({ error: "Abandoned cart has no email", status: 400 })
    }

    const currentReminders = cart.remindersSent ?? 0
    const nextReminderNumber = (currentReminders >= 2
      ? 3
      : (currentReminders + 1)) as 1 | 2 | 3

    await sendAbandonedCartEmail(cart.email, cart.cartData as any, nextReminderNumber)

    const updated = await prisma.abandonedCart.update({
      where: { id: cart.id },
      data: {
        remindersSent: currentReminders + 1,
        lastReminder: new Date(),
      },
    })

    return createApiResponse({
      data: {
        id: updated.id,
        remindersSent: updated.remindersSent,
        lastReminder: updated.lastReminder,
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
