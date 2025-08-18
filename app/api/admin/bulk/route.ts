import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { apiResponse, apiError } from "@/lib/api-utils"
import { BulkOperations } from "@/lib/bulk-operations"
import { z } from "zod"

const bulkActionSchema = z.object({
  action: z.enum(["update", "delete", "activate", "deactivate", "feature", "unfeature"]),
  entityType: z.enum(["products", "orders", "users"]),
  ids: z.array(z.string()),
  data: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return apiError("Unauthorized", 401)
    }

    const body = await request.json()
    const { action, entityType, ids, data } = bulkActionSchema.parse(body)

    let result

    switch (entityType) {
      case "products":
        if (action === "delete") {
          result = await BulkOperations.deleteProducts(ids, userId)
        } else if (action === "activate") {
          result = await BulkOperations.updateProducts(ids, { isActive: true }, userId)
        } else if (action === "deactivate") {
          result = await BulkOperations.updateProducts(ids, { isActive: false }, userId)
        } else if (action === "feature") {
          result = await BulkOperations.updateProducts(ids, { isFeatured: true }, userId)
        } else if (action === "unfeature") {
          result = await BulkOperations.updateProducts(ids, { isFeatured: false }, userId)
        } else if (action === "update" && data) {
          result = await BulkOperations.updateProducts(ids, data, userId)
        }
        break

      case "orders":
        if (action === "update" && data) {
          result = await BulkOperations.updateOrders(ids, data, userId)
        }
        break

      case "users":
        if (action === "update" && data) {
          result = await BulkOperations.updateUsers(ids, data, userId)
        }
        break
    }

    return apiResponse({
      success: true,
      affected: result?.count || 0,
      message: `Successfully ${action}d ${result?.count || 0} ${entityType}`,
    })
  } catch (error) {
    console.error("Bulk operation error:", error)
    return apiError("Bulk operation failed")
  }
}
