import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    // Get categories with product counts
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'active'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get price range for active products
    const priceRange = await prisma.product.aggregate({
      where: {
        status: 'active',
        ...(category && {
          category: {
            slug: category
          }
        })
      },
      _min: {
        price: true
      },
      _max: {
        price: true
      }
    })

    // Get available sizes (if products have variants)
    const sizes = await prisma.product.findMany({
      where: {
        status: 'active',
        variants: {
          some: {}
        }
      },
      select: {
        variants: {
          select: {
            size: true
          }
        }
      },
      distinct: ['variants']
    })

    const uniqueSizes = [...new Set(
      sizes.flatMap(p => p.variants.map(v => v.size).filter(Boolean))
    )].sort()

    // Get available colors
    const colors = await prisma.product.findMany({
      where: {
        status: 'active',
        variants: {
          some: {}
        }
      },
      select: {
        variants: {
          select: {
            color: true,
            colorCode: true
          }
        }
      }
    })

    const uniqueColors = colors.reduce((acc, p) => {
      p.variants.forEach(v => {
        if (v.color && !acc.find(c => c.name === v.color)) {
          acc.push({
            name: v.color,
            code: v.colorCode || '#000000'
          })
        }
      })
      return acc
    }, [] as { name: string; code: string }[])

    // Get brands (if products have brand field)
    const brands = await prisma.product.findMany({
      where: {
        status: 'active',
        brand: {
          not: null
        }
      },
      select: {
        brand: true
      },
      distinct: ['brand']
    })

    const uniqueBrands = brands
      .map(b => b.brand)
      .filter(Boolean)
      .sort()

    // Get rating ranges
    const ratingRanges = [
      { label: '4+ Stars', min: 4, max: 5 },
      { label: '3+ Stars', min: 3, max: 5 },
      { label: '2+ Stars', min: 2, max: 5 },
      { label: '1+ Stars', min: 1, max: 5 }
    ]

    return createApiResponse({
      data: {
        categories: categories.map(cat => ({
          id: cat.id,
          label: cat.name,
          value: cat.slug,
          count: cat._count.products
        })),
        priceRange: {
          min: priceRange._min.price || 0,
          max: priceRange._max.price || 1000
        },
        sizes: uniqueSizes.map(size => ({
          label: size,
          value: size
        })),
        colors: uniqueColors.map(color => ({
          label: color.name,
          value: color.name,
          code: color.code
        })),
        brands: uniqueBrands.map(brand => ({
          label: brand,
          value: brand
        })),
        ratings: ratingRanges
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
