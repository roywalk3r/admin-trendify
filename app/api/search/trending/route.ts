import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit'
import { redis } from '@/lib/redis'

// Cache trending searches for 1 hour
const CACHE_TTL = 3600
const CACHE_KEY = 'trending_searches'

export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      // Try to get from cache first
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        return NextResponse.json({
          success: true,
          trending: JSON.parse(cached),
          cached: true
        })
      }

      // Calculate trending searches based on recent activity
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Get top products based on orders
      const topProducts = await prisma.product.findMany({
        where: {
          status: 'active',
          orders: {
            some: {
              createdAt: {
                gte: thirtyDaysAgo
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              orders: {
                where: {
                  createdAt: {
                    gte: thirtyDaysAgo
                  }
                }
              },
              reviews: true,
              wishlistItems: true
            }
          },
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        },
        take: 50
      })

      // Get popular categories
      const topCategories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: {
                where: {
                  status: 'active',
                  orders: {
                    some: {
                      createdAt: {
                        gte: thirtyDaysAgo
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 20
      })

      // Get popular tags
      const topTags = await prisma.tag.findMany({
        include: {
          _count: {
            select: {
              products: {
                where: {
                  status: 'active',
                  orders: {
                    some: {
                      createdAt: {
                        gte: thirtyDaysAgo
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 20
      })

      // Generate trending search terms
      const trendingTerms = []

      // Add popular product names
      topProducts.slice(0, 15).forEach(product => {
        trendingTerms.push({
          term: product.name.toLowerCase(),
          type: 'product',
          popularity: product._count.orders,
          category: product.category?.name
        })
      })

      // Add popular categories
      topCategories.slice(0, 8).forEach(category => {
        if (category._count.products > 0) {
          trendingTerms.push({
            term: category.name.toLowerCase(),
            type: 'category',
            popularity: category._count.products
          })
        }
      })

      // Add popular tags
      topTags.slice(0, 8).forEach(tag => {
        if (tag._count.products > 0) {
          trendingTerms.push({
            term: tag.name.toLowerCase(),
            type: 'tag',
            popularity: tag._count.products
          })
        }
      })

      // Generate compound search terms
      const compoundTerms = []
      
      // Category + product type combinations
      const productTypes = ['shirt', 'pants', 'shoes', 'jacket', 'dress', 'bag', 'watch', 'headphones']
      topCategories.slice(0, 5).forEach(category => {
        productTypes.forEach(type => {
          compoundTerms.push({
            term: `${category.name.toLowerCase()} ${type}`,
            type: 'compound',
            popularity: Math.floor(Math.random() * 50) + 10 // Mock popularity
          })
        })
      })

      // Seasonal and occasion-based terms
      const seasonalTerms = [
        { term: 'summer collection', type: 'seasonal', popularity: 80 },
        { term: 'winter essentials', type: 'seasonal', popularity: 75 },
        { term: 'party wear', type: 'occasion', popularity: 70 },
        { term: 'work from home', type: 'occasion', popularity: 65 },
        { term: 'gym essentials', type: 'occasion', popularity: 60 },
        { term: 'travel accessories', type: 'occasion', popularity: 55 }
      ]

      trendingTerms.push(...seasonalTerms)

      // Sort by popularity and deduplicate
      const uniqueTerms = new Map()
      trendingTerms.forEach(item => {
        if (!uniqueTerms.has(item.term) || uniqueTerms.get(item.term).popularity < item.popularity) {
          uniqueTerms.set(item.term, item)
        }
      })

      const sortedTrending = Array.from(uniqueTerms.values())
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20)

      // Extract just the terms for the response
      const trendingSearches = sortedTrending.map(item => item.term)

      // Cache the results
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(trendingSearches))

      return NextResponse.json({
        success: true,
        trending: trendingSearches,
        cached: false,
        metadata: {
          totalTerms: sortedTrending.length,
          categories: sortedTrending.filter(t => t.type === 'category').length,
          products: sortedTrending.filter(t => t.type === 'product').length,
          tags: sortedTrending.filter(t => t.type === 'tag').length,
          seasonal: sortedTrending.filter(t => t.type === 'seasonal').length
        }
      })

    } catch (error) {
      console.error('Trending searches error:', error)
      
      // Fallback trending searches
      const fallbackTrending = [
        'summer collection',
        'wireless headphones',
        'running shoes',
        'smart watch',
        'yoga mat',
        'denim jacket',
        'canvas sneakers',
        'leather bag',
        'sunglasses',
        'fitness tracker'
      ]

      return NextResponse.json({
        success: true,
        trending: fallbackTrending,
        fallback: true
      })
    }
  }
)
