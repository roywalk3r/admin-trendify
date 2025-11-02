import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { withCors, handleOptions } from "@/lib/cors"

const upsertSchema = z.object({
  deviceId: z.string().min(1),
  platform: z.enum(["ios", "android", "web", "other"]).default("other"),
  token: z.string().min(10),
})

const deleteSchema = z.object({
  token: z.string().min(10).optional(),
  deviceId: z.string().min(1).optional(),
})

export async function OPTIONS(req: NextRequest) { return handleOptions(req, { credentials: true }) }

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await req.json().catch(() => ({}))
    const parsed = upsertSchema.safeParse(body)
    if (!parsed.success) return createApiResponse({ status: 400, error: parsed.error.flatten() as any })

    const { deviceId, platform, token } = parsed.data

    const record = await prisma.devicePushToken.upsert({
      where: { token },
      update: { userId: userId ?? undefined, deviceId, platform, lastUsedAt: new Date() },
      create: { userId: userId ?? undefined, deviceId, platform, token },
    })

    const res = createApiResponse({ status: 200, data: { id: record.id } })
    return withCors(res, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) return createApiResponse({ status: 400, error: parsed.error.flatten() as any })

    const { token, deviceId } = parsed.data
    if (!token && !deviceId) return createApiResponse({ status: 400, error: "token or deviceId is required" })

    if (token) await prisma.devicePushToken.deleteMany({ where: { token } })
    if (deviceId) await prisma.devicePushToken.deleteMany({ where: { deviceId } })

    const res = createApiResponse({ status: 200, data: { ok: true } })
    return withCors(res, req, { credentials: true })
  } catch (e) {
    const out = handleApiError(e)
    return withCors(out, req, { credentials: true })
  }
}
