import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { prismaCache } from "@/lib/prisma-cache"

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params

    if (!id) {
      return createApiResponse({ error: "Product ID is required", status: 400 })
    }

    const product = await prisma.product.findUnique({
      cacheStrategy: prismaCache.long(),
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
      return createApiResponse({ error: "Product not found", status: 404 })
    }

    return createApiResponse({ data: product })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    return NextResponse.json(createApiResponse({ data: updatedProduct }))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params

    // Delete the product
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
