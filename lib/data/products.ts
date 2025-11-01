import prisma from "@/lib/prisma"
import { getCache, setCache, deleteCache, deleteByPattern } from "@/lib/redis"

const TTL_PRODUCT = 300 // 5 min
const TTL_LIST = 300 // 5 min

const productKey = (id: string) => `cache:products:${id}`
const productListKey = (params: Record<string, any>) => {
  const base = {
    search: params.search ?? "",
    category: params.category ?? "all",
    status: params.status ?? "all",
    featured: params.featured ?? "all",
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
    page: Number(params.page ?? 1),
    limit: Number(params.limit ?? 20),
  }
  return `cache:products:list:${Buffer.from(JSON.stringify(base)).toString("base64")}`
}

export async function getProductByIdCached(id: string) {
  const key = productKey(id)
  const cached = await getCache<any>(key)
  if (cached) return cached

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
  })
  if (product) await setCache(key, product, TTL_PRODUCT)
  return product
}

export async function getProductsListCached(params: Record<string, any>) {
  const key = productListKey(params)
  const cached = await getCache<any>(key)
  if (cached) return cached

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

  const totalCount = await prisma.product.count({ where })
  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
    orderBy,
    skip: params.page && params.limit ? (params.page - 1) * params.limit : 0,
    take: params.limit ?? 20,
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

  await setCache(key, response, TTL_LIST)
  return response
}

export async function invalidateProduct(id: string) {
  await deleteCache(productKey(id))
}

export async function invalidateProductLists() {
  await deleteByPattern("cache:products:list:*")
}
