import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createApiResponse, handleApiError } from '@/lib/api-utils'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'approved', 'all']).default('pending'),
})

/**
 * Get reviews pending moderation
 * GET /api/admin/reviews/pending?page=1&limit=20&status=pending
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return createApiResponse({ error: 'Unauthorized', status: 401 })
    }

    // Check if user is admin/staff
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (user?.role !== 'admin' && user?.role !== 'staff') {
      return createApiResponse({ error: 'Forbidden - Admin access required', status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const { page, limit, status } = querySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
    })

    const skip = (page - 1) * limit

    // Build where clause based on status filter
    const where: any = {
      deletedAt: null,
    }

    if (status === 'pending') {
      where.isApproved = false
    } else if (status === 'approved') {
      where.isApproved = true
    }
    // if status === 'all', don't filter by isApproved

    const [reviews, total, pendingCount, approvedCount] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              slug: true,
            }
          }
        }
      }),
      prisma.review.count({ where }),
      prisma.review.count({ where: { isApproved: false, deletedAt: null } }),
      prisma.review.count({ where: { isApproved: true, deletedAt: null } }),
    ])

    return createApiResponse({
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: {
          pending: pendingCount,
          approved: approvedCount,
          total: pendingCount + approvedCount,
        }
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
