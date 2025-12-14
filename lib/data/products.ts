import prisma from "@/lib/prisma"
import { prismaCache } from "@/lib/prisma-cache"

export async function getProductByIdCached(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
      reviews: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: true, orderItems: true, wishlistItems: true } },
    },
    cacheStrategy: prismaCache.medium(),
  })
  return product
}

export async function getProductsListCached(params: Record<string, any>) {
  // Build where clause (same logic as route)
  const where: any = { isDeleted: false }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ]
  }
  if (params.category && params.category !== "all") where.categoryId = params.category
  if (params.status && params.status !== "all") where.status = params.status
  if (params.featured && params.featured !== "all") where.isFeatured = params.featured === "true"

  const orderBy: any = {}
  if (params.sortBy === "category") orderBy.category = { name: params.sortOrder }
  else orderBy[params.sortBy || "createdAt"] = params.sortOrder || "desc"

  const totalCount = await prisma.product.count({ where, cacheStrategy: prismaCache.medium() })
  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
    orderBy,
    skip: params.page && params.limit ? (params.page - 1) * params.limit : 0,
    take: params.limit ?? 20,
    cacheStrategy: prismaCache.medium(),
  })

  const totalPages = Math.ceil(totalCount / (params.limit ?? 20))
  const response = {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
      category: product.category,
      images: product.images,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      reviewCount: product._count.reviews,
      orderCount: product._count.orderItems,
    })),
    pagination: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      totalCount,
      totalPages,
      hasNextPage: (params.page ?? 1) < totalPages,
      hasPrevPage: (params.page ?? 1) > 1,
    },
    filters: params,
  }
  return response
}

export async function invalidateProduct(id: string) {
  void id
}

export async function invalidateProductLists() {
}
