import { prisma } from "@/lib/prisma"
import { AuditLogger } from "@/lib/audit-logger"

export class BulkOperations {
  static async updateProducts(ids: string[], updates: any, userId?: string) {
    const oldProducts = await prisma.product.findMany({
      where: { id: { in: ids } },
    })

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: updates,
    })

    await AuditLogger.logBulkAction("UPDATE", "Product", ids, { updates, count: result.count }, userId)
    return result
  }

  static async deleteProducts(ids: string[], userId?: string) {
    const oldProducts = await prisma.product.findMany({
      where: { id: { in: ids } },
    })

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true, deletedAt: new Date() },
    })

    await AuditLogger.logBulkAction("DELETE", "Product", ids, { count: result.count }, userId)
    return result
  }

  static async updateOrders(ids: string[], updates: any, userId?: string) {
    const result = await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: updates,
    })

    await AuditLogger.logBulkAction("UPDATE", "Order", ids, { updates, count: result.count }, userId)
    return result
  }

  static async updateUsers(ids: string[], updates: any, userId?: string) {
    const result = await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: updates,
    })

    await AuditLogger.logBulkAction("UPDATE", "User", ids, { updates, count: result.count }, userId)
    return result
  }
}
