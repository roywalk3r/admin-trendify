import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const session = await prisma.guestSession.findUnique({ 
      where: { id: params.id }
    })
    
    if (!session) return createApiResponse({ status: 404, error: "Guest session not found" })
    
    return createApiResponse({ data: session, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    await prisma.guestSession.delete({ where: { id: params.id } })
    return createApiResponse({ data: { ok: true }, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
