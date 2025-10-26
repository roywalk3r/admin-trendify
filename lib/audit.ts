/**
 * Audit Logging System
 * Tracks all admin actions for compliance and accountability
 */

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { logInfo, logError } from '@/lib/logger'

export interface AuditLogData {
  userId?: string
  userEmail?: string
  action: string // CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.
  entityType: string // Product, Order, User, Review, etc.
  entityId: string
  oldValue?: any
  newValue?: any
  req?: NextRequest
}

/**
 * Create an audit log entry
 */
export async function logAudit(data: AuditLogData) {
  try {
    const ipAddress = data.req?.headers.get('x-forwarded-for') || data.req?.headers.get('x-real-ip') || null
    const userAgent = data.req?.headers.get('user-agent') || null

    await prisma.audit.create({
      data: {
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        ipAddress,
        userAgent,
      },
    })

    logInfo('Audit log created', {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
    })
  } catch (error) {
    // Don't throw - audit logging shouldn't break the main operation
    logError(error, { context: 'Audit logging failed', data })
  }
}

/**
 * Log product update
 */
export async function logProductUpdate(
  productId: string,
  userId: string | undefined,
  userEmail: string | undefined,
  oldProduct: any,
  newProduct: any,
  req?: NextRequest
) {
  await logAudit({
    userId,
    userEmail,
    action: 'UPDATE',
    entityType: 'Product',
    entityId: productId,
    oldValue: oldProduct,
    newValue: newProduct,
    req,
  })
}

/**
 * Log order status change
 */
export async function logOrderStatusChange(
  orderId: string,
  userId: string | undefined,
  userEmail: string | undefined,
  oldStatus: string,
  newStatus: string,
  req?: NextRequest
) {
  await logAudit({
    userId,
    userEmail,
    action: 'STATUS_CHANGE',
    entityType: 'Order',
    entityId: orderId,
    oldValue: { status: oldStatus },
    newValue: { status: newStatus },
    req,
  })
}

/**
 * Log review approval/rejection
 */
export async function logReviewModeration(
  reviewId: string,
  userId: string | undefined,
  userEmail: string | undefined,
  action: 'APPROVE' | 'REJECT',
  req?: NextRequest
) {
  await logAudit({
    userId,
    userEmail,
    action,
    entityType: 'Review',
    entityId: reviewId,
    req,
  })
}

/**
 * Log user deletion/suspension
 */
export async function logUserAction(
  targetUserId: string,
  adminUserId: string | undefined,
  adminEmail: string | undefined,
  action: 'DELETE' | 'SUSPEND' | 'ACTIVATE',
  req?: NextRequest
) {
  await logAudit({
    userId: adminUserId,
    userEmail: adminEmail,
    action,
    entityType: 'User',
    entityId: targetUserId,
    req,
  })
}

/**
 * Log coupon creation/update
 */
export async function logCouponAction(
  couponId: string,
  userId: string | undefined,
  userEmail: string | undefined,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  couponData: any,
  req?: NextRequest
) {
  await logAudit({
    userId,
    userEmail,
    action,
    entityType: 'Coupon',
    entityId: couponId,
    newValue: couponData,
    req,
  })
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogs(entityType: string, entityId: string, limit = 50) {
  try {
    return await prisma.audit.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  } catch (error) {
    logError(error, { context: 'Failed to fetch audit logs', entityType, entityId })
    return []
  }
}

/**
 * Get recent audit logs (admin dashboard)
 */
export async function getRecentAuditLogs(limit = 100) {
  try {
    return await prisma.audit.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
  } catch (error) {
    logError(error, { context: 'Failed to fetch recent audit logs' })
    return []
  }
}
