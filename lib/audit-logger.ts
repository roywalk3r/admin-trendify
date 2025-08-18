import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export interface AuditLogData {
  action: string
  entityType: string
  entityId: string
  oldValue?: any
  newValue?: any
  userId?: string
}

export class AuditLogger {
  static async log(data: AuditLogData) {
    try {
      const { userId: clerkUserId } = await auth()

      await prisma.audit.create({
        data: {
          userId: data.userId || clerkUserId || undefined,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValue: data.oldValue || null,
          newValue: data.newValue || null,
        },
      })
    } catch (error) {
      console.error("Failed to log audit entry:", error)
    }
  }

  static async logCreate(entityType: string, entityId: string, newValue: any, userId?: string) {
    await this.log({
      action: "CREATE",
      entityType,
      entityId,
      newValue,
      userId,
    })
  }

  static async logUpdate(entityType: string, entityId: string, oldValue: any, newValue: any, userId?: string) {
    await this.log({
      action: "UPDATE",
      entityType,
      entityId,
      oldValue,
      newValue,
      userId,
    })
  }

  static async logDelete(entityType: string, entityId: string, oldValue: any, userId?: string) {
    await this.log({
      action: "DELETE",
      entityType,
      entityId,
      oldValue,
      userId,
    })
  }

  static async logBulkAction(action: string, entityType: string, entityIds: string[], metadata?: any, userId?: string) {
    await this.log({
      action: `BULK_${action}`,
      entityType,
      entityId: entityIds.join(","),
      newValue: { entityIds, metadata },
      userId,
    })
  }
}
