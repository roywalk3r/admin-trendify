import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { getCache, setCache, deleteCache } from "@/lib/redis"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    const productId = params.id
    const cacheKey = `product:${productId}`

    // 🔹 Attempt to fetch from Redis cache
    const cachedProduct = await getCache(cacheKey)
    if (cachedProduct) {
      return NextResponse.json({ data: cachedProduct, cached: true })
    }

    // 🔹 Fetch from DB if not in cache
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    })

    if (!product) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    // 🔹 Store in cache for 5 minutes (300 seconds)
    await setCache(cacheKey, product, 300)

    return createApiResponse({
      data: product,
      status: 200,
    })
  } catch (error) {
    console.error(`Error fetching product with ID ${params.id}:`, error)
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    const productId = params.id
    const data = await req.json()
    const cacheKey = `product:${productId}`

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.category_id,
        images: data.images,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    })

    // 🔹 Update cache with new product data
    await setCache(cacheKey, updatedProduct, 300)

    return createApiResponse({
      data: updatedProduct,
      status: 200,
    })
  } catch (error) {
    console.error(`Error updating product with ID ${params.id}:`, error)
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await adminAuthMiddleware(req)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    const productId = params.id
    const cacheKey = `product:${productId}`
    console.log("Deleting product with ID:", productId)

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      })
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    // 🔹 Invalidate the cache after deletion
    await deleteCache(cacheKey)

    return createApiResponse({
      data: { message: "Product deleted successfully" },
      status: 200,
    })
  } catch (error) {
    console.error(`Error deleting product with ID ${params.id}:`, error)
    return handleApiError(error)
  }
}
