import prisma from "@/lib/prisma"
import { prismaCache } from "@/lib/prisma-cache"

export async function getCategoriesCached(params: Record<string, any>) {
  // Build where clause mirroring route logic
  const where: any = {}
  if (params.parentId !== undefined) where.parentId = params.parentId
  else if (params.parentId === "") where.parentId = null
  if (!params.includeDeleted) {
    where.deletedAt = null
    where.isActive = true
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { slug: { contains: params.search, mode: "insensitive" } },
    ]
  }

  let orderBy: any = {}
  if (params.sortBy === "productCount") orderBy = { products: { _count: params.sortOrder } }
  else orderBy[params.sortBy || "name"] = params.sortOrder || "asc"

  const page = Number(params.page ?? 1)
  const limit = Number(params.limit ?? 20)
  const skip = (page - 1) * limit

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        products: params.withProducts
          ? {
              select: { id: true, name: true, price: true, images: true, slug: true, stock: true },
              where: { isDeleted: false, deletedAt: null, isActive: true },
              take: 4,
            }
          : false,
        children: params.includeChildren
          ? {
              include: {
                _count: { select: { products: true } },
              },
            }
          : false,
        _count: {
          select: {
            products: { where: { isDeleted: false, deletedAt: null, isActive: true } },
            children: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
      cacheStrategy: prismaCache.long(),
    }),
    prisma.category.count({ where, cacheStrategy: prismaCache.long() }),
  ])

  const totalPages = Math.ceil(totalCount / limit)
  const response = {
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      description: c.description,
      parentId: c.parentId,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      _count: c._count,
      products: (c as any).products ? (c as any).products.map((p: any) => ({ ...p, price: Number(p.price) })) : undefined,
      children: (c as any).children || undefined,
    })),
    meta: {
      currentPage: page,
      totalPages,
      totalCount,
    },
  }
  return response
}

export async function getCategoryByIdCached(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        select: { id: true, name: true, price: true, images: true, slug: true, stock: true },
        where: { isDeleted: false, deletedAt: null, isActive: true },
        take: 10,
      },
      children: { include: { _count: { select: { products: true } } } },
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: { where: { isDeleted: false, deletedAt: null, isActive: true } }, children: true } },
    },
    // cacheStrategy: prismaCache.long(),
  })

  if (!category) return null

  const result = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    parentId: category.parentId,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    _count: category._count,
    products: (category as any).products,
    children: (category as any).children,
    parent: (category as any).parent,
  }
  return result
}

export async function invalidateCategoriesLists() {
}
export async function invalidateCategory(id: string) {
  void id
}
