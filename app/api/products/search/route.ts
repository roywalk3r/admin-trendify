import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateQuery } from '@/lib/validations/helpers'
import { productSearchSchema } from '@/lib/validations/schemas'
import { withRateLimit } from '@/lib/rate-limit'

export const GET = withRateLimit(
  { limit: 100, windowSeconds: 60 },
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const validatedQuery = validateQuery(productSearchSchema, searchParams)

      const {
        query,
        category,
        minPrice,
        maxPrice,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 20,
        tags,
        colors,
        sizes,
        rating,
        inStock,
        onSale
      } = validatedQuery

      // Build the where clause
      const where: any = {
        status: 'active'
      }

      // Text search
      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } }
        ]
      }

      // Category filter
      if (category) {
        where.category = {
          slug: category
        }
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) where.price.gte = minPrice
        if (maxPrice !== undefined) where.price.lte = maxPrice
      }

      // Tags filter
      if (tags && tags.length > 0) {
        where.tags = {
          some: {
            tag: {
              name: {
                in: tags
              }
            }
          }
        }
      }

      // Rating filter
      if (rating && rating > 0) {
        where.reviews = {
          some: {
            rating: {
              gte: rating
            }
          }
        }
      }

      // Stock filter
      if (inStock) {
        where.stock = {
          gt: 0
        }
      }

      // Sale filter
      if (onSale) {
        where.comparePrice = {
          not: null
        }
        where.price = {
          lt: prisma.product.fields.comparePrice
        }
      }

      // Color and size filters (variant attributes)
      if (colors && colors.length > 0 || sizes && sizes.length > 0) {
        where.variants = {
          some: {
            AND: []
          }
        }

        if (colors && colors.length > 0) {
          where.variants.some.AND.push({
            attributes: {
              path: ['color'],
              stringContains: colors[0] // This would need to be adjusted for proper JSON filtering
            }
          })
        }

        if (sizes && sizes.length > 0) {
          where.variants.some.AND.push({
            attributes: {
              path: ['size'],
              stringContains: sizes[0] // This would need to be adjusted for proper JSON filtering
            }
          })
        }
      }

      // Build order by clause
      const orderBy: any = {}
      switch (sortBy) {
        case 'price':
          orderBy.price = sortOrder
          break
        case 'rating':
          orderBy.reviews = {
            _avg: {
              rating: sortOrder
            }
          }
          break
        case 'newest':
          orderBy.createdAt = 'desc'
          break
        case 'popular':
          orderBy._count = {
            orders: sortOrder
          }
          break
        default:
          orderBy.name = sortOrder
      }

      // Execute the query with pagination
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            tags: {
              include: {
                tag: {
                  select: {
                    name: true
                  }
                }
              }
            },
            variants: {
              where: {
                stock: {
                  gt: 0
                }
              },
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                attributes: true
              }
            },
            _count: {
              select: {
                reviews: true,
                orders: true,
                wishlistItems: true
              }
            },
            reviews: {
              select: {
                rating: true
              },
              take: 1
            }
          }
        }),
        prisma.product.count({ where })
      ])

      // Calculate average rating for each product
      const productsWithRating = products.map(product => {
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0

        return {
          ...product,
          averageRating: avgRating,
          reviewCount: product._count.reviews,
          tags: product.tags.map(pt => pt.tag.name)
        }
      })

      // Get available filters for the UI
      const [categories, allTags, priceRange] = await Promise.all([
        prisma.category.findMany({
          where: {
            products: {
              some: {
                status: 'active'
              }
            }
          },
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
          }
        }),
        prisma.tag.findMany({
          where: {
            products: {
              some: {
                status: 'active'
              }
            }
          },
          select: {
            name: true,
            _count: {
              select: {
                products: {
                  where: {
                    status: 'active'
                  }
                }
              }
            }
          }
        }),
        prisma.product.aggregate({
          where: {
            status: 'active'
          },
          _min: {
            price: true
          },
          _max: {
            price: true
          }
        })
      ])

      // Extract unique colors and sizes from variants
      const allVariants = await prisma.productVariant.findMany({
        where: {
          product: {
            status: 'active'
          },
          stock: {
            gt: 0
          }
        },
        select: {
          attributes: true
        }
      })

      const colors = new Map<string, number>()
      const sizes = new Map<string, number>()

      allVariants.forEach(variant => {
        const attributes = variant.attributes as Record<string, any>
        
        if (attributes.color) {
          const color = attributes.color
          colors.set(color, (colors.get(color) || 0) + 1)
        }
        
        if (attributes.size) {
          const size = attributes.size
          sizes.set(size, (sizes.get(size) || 0) + 1)
        }
      })

      const availableFilters = {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          count: cat._count.products
        })),
        colors: Array.from(colors.entries()).map(([name, count]) => ({
          name,
          hex: getColorHex(name), // Helper function to get hex color
          count
        })),
        sizes: Array.from(sizes.entries()).map(([name, count]) => ({
          name,
          count
        })),
        tags: allTags.map(tag => ({
          name: tag.name,
          count: tag._count.products
        })),
        priceRange: {
          min: priceRange._min.price || 0,
          max: priceRange._max.price || 1000
        }
      }

      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        success: true,
        data: {
          products: productsWithRating,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          filters: availableFilters
        }
      })

    } catch (error) {
      console.error('Product search error:', error)
      
      if (error instanceof Error && error.message.includes('Query validation failed')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid query parameters',
            message: error.message
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'Failed to search products'
        },
        { status: 500 }
      )
    }
  }
)

// Helper function to get hex color for common color names
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'purple': '#8B5CF6',
    'pink': '#EC4899',
    'orange': '#F97316',
    'gray': '#6B7280',
    'brown': '#92400E',
    'navy': '#1E3A8A'
  }
  
  return colorMap[colorName.toLowerCase()] || '#6B7280'
}
