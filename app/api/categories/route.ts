import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { deleteCache, getCache, setCache } from "@/lib/redis"

// Category validation schema
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  image: z.string().url("Invalid image URL").optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
})

// Query params validation schema
const queriesSchema = z.object({
  withProducts: z.string().optional().transform(val => val === "true"),
  includeChildren: z.string().optional().transform(val => val === "true"),
  parentId: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional().transform(val => parseInt(val || "1")),
  limit: z.string().optional().transform(val => parseInt(val || "20")),
  sortBy: z.enum(["name", "createdAt", "updatedAt", "productCount"]).optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  includeDeleted: z.string().optional().transform(val => val === "true"),
})

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)

    // Parse and validate query parameters
    const {
      withProducts,
      includeChildren,
      parentId,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      includeDeleted
    } = queriesSchema.parse(Object.fromEntries(url.searchParams))

    // Build cache key based on query parameters
    const cacheKey = `categories:${JSON.stringify({
      withProducts,
      includeChildren,
      parentId,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      includeDeleted
    })}`

    // Check cache first
    const cachedData = await getCache(cacheKey)
    if (cachedData) {
      return NextResponse.json({ data: cachedData, cached: true })
    }

    // Build where clause
    const where: any = {}

    if (parentId) {
      where.parentId = parentId
    } else if (parentId === '') {
      // Explicitly query for root categories (no parent)
      where.parentId = null
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (!includeDeleted) {
      where.deletedAt = null
    }

    // Build orderBy
    let orderBy: any = {}

    if (sortBy === 'productCount') {
      // Special case for sorting by product count
      orderBy = { products: { _count: sortOrder } }
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch categories with appropriate includes
    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          products: withProducts
              ? {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                  slug: true,
                  stock: true,
                },
                where: { isDeleted: false, deletedAt: null },
                take: 4,
              }
              : false,
          children: includeChildren
              ? {
                include: {
                  _count: {
                    select: {
                      products: true,
                    },
                  },
                },
              }
              : false,
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const result = {
      data: categories,
      meta: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
      },
    }

    // Cache result for 5 minutes
    await setCache(cacheKey, result, 300)

    return createApiResponse({
      ...result,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    // Check if user is authenticated and is an admin
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = categorySchema.parse(body)

    // If parentId is provided, verify it exists
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parentCategory) {
        return createApiResponse({
          error: "Parent category not found",
          status: 404,
        })
      }
    }

    // Check if category with same name or slug already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug: validatedData.slug }],
        deletedAt: null,
      },
    })

    if (existingCategory) {
      return createApiResponse({
        error: "A category with this name or slug already exists",
        status: 409,
      })
    }

    // Create category
    const category = await prisma.category.create({
      data: validatedData,
    })

    // Invalidate all category caches
    await deleteCache("categories:*")

    return createApiResponse({
      data: category,
      status: 201,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    // Parse and validate request body
    const body = await req.json()
    const { id, ...validatedData } = categorySchema.parse(body)

    if (!id) {
      return createApiResponse({
        error: "Category ID is required",
        status: 400,
      })
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return createApiResponse({
        error: "Category not found",
        status: 404,
      })
    }

    // If parentId is being changed, check for circular references
    if (validatedData.parentId && validatedData.parentId !== existingCategory.parentId) {
      // Cannot set parent to self
      if (validatedData.parentId === id) {
        return createApiResponse({
          error: "A category cannot be its own parent",
          status: 400,
        })
      }

      // Check if the new parent exists
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parentCategory) {
        return createApiResponse({
          error: "Parent category not found",
          status: 404,
        })
      }

      // Check for circular reference in category hierarchy
      let currentParent = validatedData.parentId
      while (currentParent) {
        if (currentParent === id) {
          return createApiResponse({
            error: "Circular reference detected in category hierarchy",
            status: 400,
          })
        }

        const parent:any = await prisma.category.findUnique({
          where: { id: currentParent },
          select: { parentId: true }
        })

        if (!parent) break
        currentParent = parent.parentId
      }
    }

    // Check if slug or name conflicts with another category
    const conflictingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug: validatedData.slug }],
        NOT: { id },
        deletedAt: null,
      },
    })

    if (conflictingCategory) {
      return createApiResponse({
        error: "A different category with this name or slug already exists",
        status: 409,
      })
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
    })

    // Invalidate all category caches
    await deleteCache("categories:*")

    return createApiResponse({
      data: updatedCategory,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const force = url.searchParams.get("force") === "true"

    if (!id) {
      return createApiResponse({
        error: "Category ID is required",
        status: 400,
      })
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return createApiResponse({
        error: "Category not found",
        status: 404,
      })
    }

    // Check if category has products or child categories
    if (!force && (existingCategory._count.products > 0 || existingCategory._count.children > 0)) {
      return createApiResponse({
        error: "Cannot delete category with associated products or subcategories",
        status: 409,
      })
    }

    if (force) {
      // Hard delete
      await prisma.category.delete({
        where: { id },
      })
    } else {
      // Soft delete
      await prisma.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    }

    // Invalidate all category caches
    await deleteCache("categories:*")

    return createApiResponse({
      data: { message: "Category deleted successfully", force },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// New endpoint to fetch a single category by ID or slug
export async function getCategory(
    req: NextRequest,
    { params }: { params: { identifier: string } }
) {
  try {
    const identifier = params.identifier
    const url = new URL(req.url)
    const withProducts = url.searchParams.get("withProducts") === "true"
    const includeChildren = url.searchParams.get("includeChildren") === "true"

    // Build cache key
    const cacheKey = `category:${identifier}:${withProducts}:${includeChildren}`

    // Check cache first
    const cachedData = await getCache(cacheKey)
    if (cachedData) {
      return NextResponse.json({ data: cachedData, cached: true })
    }

    // Check if identifier is an ID or slug
    const isId = /^[a-zA-Z0-9-_]{20,}$/.test(identifier)

    // Fetch category
    const category = await prisma.category.findUnique({
      where: isId ? { id: identifier } : { slug: identifier },
      include: {
        parent: true,
        products: withProducts
            ? {
              select: {
                id: true,
                name: true,
                price: true,
                comparePrice: true,
                images: true,
                slug: true,
                stock: true,
                createdAt: true,
              },
              where: { isDeleted: false, deletedAt: null },
            }
            : false,
        children: includeChildren
            ? {
              include: {
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
            }
            : false,
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      return createApiResponse({
        error: "Category not found",
        status: 404,
      })
    }

    // Cache result for 5 minutes
    await setCache(cacheKey, category, 300)

    return createApiResponse({
      data: category,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// New endpoint to get the full category path (breadcrumbs)
export async function getCategoryPath(
    req: NextRequest,
    { params }: { params: { identifier: string } }
) {
  try {
    const identifier = params.identifier

    // Build cache key
    const cacheKey = `category-path:${identifier}`

    // Check cache first
    const cachedData = await getCache(cacheKey)
    if (cachedData) {
      return NextResponse.json({ data: cachedData, cached: true })
    }

    // Check if identifier is an ID or slug
    const isId = /^[a-zA-Z0-9-_]{20,}$/.test(identifier)

    // Find the category
    let category :any = await prisma.category.findUnique({
      where: isId ? { id: identifier } : { slug: identifier },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    })

    if (!category) {
      return createApiResponse({
        error: "Category not found",
        status: 404,
      })
    }

    // Build the path by traversing up the hierarchy
    const path = [category]

    while (category.parentId) {
      const parent:any = await prisma.category.findUnique({
        where: { id: category.parentId },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      })

      if (!parent) break

      path.unshift(parent)
      category = parent
    }

    // Cache result for 5 minutes
    await setCache(cacheKey, path, 300)

    return createApiResponse({
      data: path,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// New endpoint to get category tree
export async function getCategoryTree(req: NextRequest) {
  try {
    // Build cache key
    const cacheKey = "category-tree"

    // Check cache first
    const cachedData = await getCache(cacheKey)
    if (cachedData) {
      return NextResponse.json({ data: cachedData, cached: true })
    }

    // Get all root categories (categories without parents)
    const rootCategories = await prisma.category.findMany({
      where: { parentId: null, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        children: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            children: {
              where: { deletedAt: null },
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    // Cache result for 5 minutes
    await setCache(cacheKey, rootCategories, 300)

    return createApiResponse({
      data: rootCategories,
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// Bulk operations endpoint for categories
export async function bulkOperations(req: NextRequest) {
  try {
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      })
    }

    const body = await req.json()
    const { operation, categoryIds } = body

    if (!operation || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return createApiResponse({
        error: "Invalid request parameters",
        status: 400,
      })
    }

    let result

    switch (operation) {
      case "delete":
        // Soft delete multiple categories
        result = await prisma.category.updateMany({
          where: { id: { in: categoryIds } },
          data: { deletedAt: new Date() },
        })
        break

      case "restore":
        // Restore soft-deleted categories
        result = await prisma.category.updateMany({
          where: { id: { in: categoryIds } },
          data: { deletedAt: null },
        })
        break

      case "forceDelete":
        // Hard delete multiple categories
        result = await prisma.category.deleteMany({
          where: { id: { in: categoryIds } },
        })
        break

      default:
        return createApiResponse({
          error: "Unsupported operation",
          status: 400,
        })
    }

    // Invalidate all category caches
    await deleteCache("categories:*")
    await deleteCache("category-*")

    return createApiResponse({
      data: { message: `${operation} operation completed successfully`, affected: result.count },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}