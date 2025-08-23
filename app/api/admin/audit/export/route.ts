import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { isAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

function csvEscape(value: any): string {
  if (value === null || value === undefined) return ""
  const str = typeof value === "string" ? value : JSON.stringify(value)
  // Escape double quotes by doubling them, wrap field in quotes
  const escaped = str.replace(/"/g, '""')
  return `"${escaped}"`
}

export async function GET(request: NextRequest) {
  const admin = await isAdmin()
  if (!admin) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const entityType = searchParams.get("entityType") || undefined
  const action = searchParams.get("action") || undefined
  const startDate = searchParams.get("startDate") || undefined
  const endDate = searchParams.get("endDate") || undefined
  const q = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || "createdAt"
  const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc"
  const limitParam = Number.parseInt(searchParams.get("limit") || "1000")
  const limit = Math.max(1, Math.min(5000, limitParam))

  const where: any = {}
  if (entityType) where.entityType = entityType
  if (action) where.action = action
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }
  if (q) {
    const contains = { contains: q, mode: 'insensitive' as const }
    where.OR = [
      { entityId: contains },
      { entityType: contains },
      { action: contains },
      { entityName: contains },
      { ipAddress: contains },
      { userAgent: contains },
      { user: { is: { name: contains } } },
      { user: { is: { email: contains } } },
    ]
  }

  const orderBy: any = (() => {
    switch (sort) {
      case 'action':
        return { action: order }
      case 'entityType':
        return { entityType: order }
      case 'user':
        // Fallback to createdAt desc if relational sort unsupported in export
        return { createdAt: order }
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

  const rows = await prisma.audit.findMany({
    where,
    orderBy,
    take: limit,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })

  const header = [
    "id",
    "createdAt",
    "action",
    "entityType",
    "entityId",
    "entityName",
    "userName",
    "userEmail",
    "ipAddress",
    "userAgent",
    "oldValue",
    "newValue",
  ]

  const lines: string[] = []
  lines.push(header.map(csvEscape).join(","))
  for (const r of rows as any[]) {
    lines.push([
      r.id,
      new Date(r.createdAt).toISOString(),
      r.action,
      r.entityType,
      r.entityId,
      r.entityName ?? "",
      r.user?.name ?? "",
      r.user?.email ?? "",
      r.ipAddress ?? "",
      r.userAgent ?? "",
      r.oldValue ?? null,
      r.newValue ?? null,
    ].map(csvEscape).join(","))
  }

  const csv = lines.join("\n")
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=audit-logs-${Date.now()}.csv`,
      "Cache-Control": "no-store",
    },
  })
}
