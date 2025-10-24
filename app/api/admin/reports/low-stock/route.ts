import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const authRes = await adminAuthMiddleware(request)
  if (authRes.status !== 200) return authRes

  const { searchParams } = new URL(request.url)
  const thresholdParam = searchParams.get("threshold")
  const categoryId = searchParams.get("category") || undefined
  const threshold = thresholdParam ? Number(thresholdParam) : undefined

  // If threshold is not provided, use per-product lowStockAlert; otherwise use provided value
  const where: any = {
    isDeleted: false,
    isActive: true,
  }
  if (categoryId && categoryId !== "all") where.categoryId = categoryId

  try {
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockAlert: true,
        images: true,
        category: { select: { id: true, name: true } },
        updatedAt: true,
      },
      orderBy: { stock: "asc" },
      take: 200,
    })

    const filtered = products.filter(p => {
      const limit = threshold ?? p.lowStockAlert
      return p.stock <= (limit ?? 5)
    })

    return NextResponse.json({
      data: {
        products: filtered,
        count: filtered.length,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch low stock products" }, { status: 500 })
  }
}
