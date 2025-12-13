import { NextRequest } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { processStockAlerts } from "@/lib/jobs/abandoned-cart-recovery"

export async function POST(req: NextRequest) {
  const authRes = await adminAuthMiddleware(req)
  if (authRes.status !== 200) return authRes

  try {
    const body = await req.json().catch(() => ({} as any))
    const productIdFromBody = (body as any)?.productId as string | undefined
    const url = new URL(req.url)
    const productId = productIdFromBody || url.searchParams.get("productId") || undefined

    if (!productId) {
      return createApiResponse({ error: "productId is required", status: 400 })
    }

    const result = await processStockAlerts(productId)

    return createApiResponse({ data: result, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
