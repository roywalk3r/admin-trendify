import type { NextRequest } from "next/server"

import prisma from "@/lib/prisma"

import { auth } from "@clerk/nextjs/server"

import { apiResponse, apiError } from "@/lib/api-utils"

import {isAdmin} from "@/lib/admin-auth";
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin()
      if (!admin) {
        return apiError("Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const entityType = searchParams.get("entityType")
    const action = searchParams.get("action")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const sort = searchParams.get("sort") || "createdAt"
    const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc"
    const q = searchParams.get("q") || ""

    const where: any = {}

    if (entityType) where.entityType = entityType
    if (action) where.action = action
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    if (q) {
      const contains = (field: string) => ({ contains: q, mode: 'insensitive' as const })
      where.OR = [
        { entityId: contains('') },
        { entityType: contains('') },
        { action: contains('') },
        { entityName: contains('') },
        { ipAddress: contains('') },
        { userAgent: contains('') },
        { user: { is: { name: contains('') } } },
        { user: { is: { email: contains('') } } },
      ]
    }

    // Sorting
    const orderBy: any = (() => {
      switch (sort) {
        case 'action':
          return { action: order }
        case 'entityType':
          return { entityType: order }
        case 'user':
          return { user: { name: order } }
        case 'ipAddress':
          return { ipAddress: order }
        case 'userAgent':
          return { userAgent: order }
        case 'createdAt':
        case 'time':
        default:
          return { createdAt: order }
      }
    })()

    const [logs, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.audit.count({ where }),
    ])

    return apiResponse({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return apiError("Failed to fetch audit logs")
  }
}
