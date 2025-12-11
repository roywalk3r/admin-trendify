import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createApiResponse, handleApiError } from '@/lib/api-utils'
import { logReviewModeration } from '@/lib/audit'

/**
 * Approve a review (make it visible to customers)
 * POST /api/admin/reviews/[id]/approve
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: 'Unauthorized', status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (user?.role !== 'admin' && user?.role !== 'staff') {
      return createApiResponse({ error: 'Forbidden - Admin access required', status: 403 })
    }

    // Update review to approved
    const review = await prisma.review.update({
      where: { id: params.id },
      data: { isApproved: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true } }
      }
    })

    // Log audit trail
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true }
    })
    await logReviewModeration(params.id, adminUser?.id, adminUser?.email, 'APPROVE', req)

    return createApiResponse({ 
      data: review, 
      status: 200,
      message: `Review by ${review.user.name} for ${review.product.name} has been approved`
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Reject/Unapprove a review (hide from customers)
 * DELETE /api/admin/reviews/[id]/approve
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: 'Unauthorized', status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (user?.role !== 'admin' && user?.role !== 'staff') {
      return createApiResponse({ error: 'Forbidden - Admin access required', status: 403 })
    }

    // Unapprove and soft delete the review
    const review = await prisma.review.update({
      where: { id: params.id },
      data: { 
        isApproved: false,
        deletedAt: new Date()
      },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } }
      }
    })

    // Log audit trail
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true }
    })
    await logReviewModeration(params.id, adminUser?.id, adminUser?.email, 'REJECT', req)

    return createApiResponse({ 
      data: { success: true, review }, 
      status: 200,
      message: `Review by ${review.user.name} has been rejected`
    })
  } catch (error) {
    return handleApiError(error)
  }
}
