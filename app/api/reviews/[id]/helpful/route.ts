import prisma from "@/lib/prisma"
import type { NextRequest } from "next/server"
import { createApiResponse, handleApiError, checkRateLimit } from "@/lib/api-utils"

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const rateKey = `helpful:${id}:${req.headers.get("x-forwarded-for")}`
    const limited = await checkRateLimit(rateKey, 5, 60_000)
    if (limited) {
      return createApiResponse({ error: "Too many requests", status: 429 })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isHelpful: { increment: 1 } as any },
      select: { id: true, isHelpful: true },
    })

    return createApiResponse({ data: updated, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
