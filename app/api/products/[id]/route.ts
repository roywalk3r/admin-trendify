import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { getCache, setCache } from "@/lib/redis"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
      )
    }

    // Try to get from cache first
    const cacheKey = `product:${id}`
    const cachedProduct = await getCache(cacheKey)

    if (cachedProduct) {
      return NextResponse.json(createApiResponse({ data: cachedProduct }))
    }

    // If not in cache, fetch from database
      const product = await prisma.product.findUnique({
          where: { id },
          include: {
              category: {
                  select: {
                      id: true,
                      name: true,
                      slug: true,
                  },
              },
              reviews: {
                  select: { rating: true },
                  orderBy: { createdAt: "desc" },
                  take: 10,
              },
              tags: {
                  include: { tag: { select: { name: true, slug: true } } },
              },
              _count: {
                  select: {
                      reviews: true,
                      wishlistItems: true,
                  },
              },
          },
      })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
      )
    }

    // Cache the product for future requests (5 minutes TTL)
    await setCache(cacheKey, product, 300)

    return NextResponse.json(createApiResponse({ data: product }))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await req.json()

    // Validate the request body
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        images: data.images,
        // Add other fields as needed
      },
    })

    // Update cache
    const cacheKey = `product:${id}`
    await setCache(cacheKey, updatedProduct, 300)

    return NextResponse.json(createApiResponse({ data: updatedProduct }))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Delete the product
    await prisma.product.delete({
      where: { id },
    })

    // Invalidate cache
    const cacheKey = `product:${id}`
    await setCache(cacheKey, null, 1) // Set TTL to 1 second to immediately invalidate

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
