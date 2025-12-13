import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit'

// Fuzzy matching utility for typo tolerance
function fuzzyMatch(str: string, pattern: string): number {
  let score = 0
  let strIdx = 0
  let patternIdx = 0
  let consecutiveMatches = 0

  while (strIdx < str.length && patternIdx < pattern.length) {
    if (str[strIdx].toLowerCase() === pattern[patternIdx].toLowerCase()) {
      score += 1 + (consecutiveMatches * 0.5)
      consecutiveMatches++
      patternIdx++
    } else {
      consecutiveMatches = 0
    }
    strIdx++
  }

  // Penalty for remaining pattern characters
  const remainingPattern = pattern.length - patternIdx
  score -= remainingPattern * 0.5

  return score
}

// Calculate relevance score for suggestions
function calculateRelevanceScore(
  item: { name: string; description?: string; sku?: string },
  query: string,
  type: string
): number {
  let score = 0
  
  // Exact name match gets highest score
  if (item.name.toLowerCase() === query.toLowerCase()) {
    score += 100
  }
  // Name starts with query
  else if (item.name.toLowerCase().startsWith(query.toLowerCase())) {
    score += 80
  }
  // Fuzzy name match
  else {
    score += fuzzyMatch(item.name, query) * 10
  }

  // Description match
  if (item.description) {
    score += fuzzyMatch(item.description, query) * 5
  }

  // SKU match
  if (item.sku) {
    score += fuzzyMatch(item.sku, query) * 15
  }

  // Type weighting
  const typeWeights = {
    product: 1.0,
    category: 0.8,
    brand: 0.6,
    tag: 0.4
  }
  score *= typeWeights[type as keyof typeof typeWeights] || 0.5

  return score
}

export const GET = withRateLimit(
  { limit: 50, windowSeconds: 60 },
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const query = searchParams.get('q')?.trim() || ''
      const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

      if (query.length < 2) {
        return NextResponse.json({
          success: true,
          suggestions: []
        })
      }

      // Search for products
      const products = await prisma.product.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          category: {
            select: { name: true, slug: true }
          },
          _count: {
            select: {
              reviews: true,
              orders: true
            }
          }
        },
        take: limit
      })

      // Search for categories
      const categories = await prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        include: {
          _count: {
            select: {
              products: {
                where: { status: 'active' }
              }
            }
          }
        },
        take: Math.floor(limit / 4)
      })

      // Search for tags
      const tags = await prisma.tag.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        include: {
          _count: {
            select: {
              products: {
                where: { status: 'active' }
              }
            }
          }
        },
        take: Math.floor(limit / 4)
      })

      // Extract brands from products
      const brands = new Map<string, number>()
      products.forEach(product => {
        // Assuming brand is stored in product attributes or name
        const brandMatch = product.name.match(/^(\w+)\s/) // Simple brand extraction
        if (brandMatch) {
          const brand = brandMatch[1]
          brands.set(brand, (brands.get(brand) || 0) + 1)
        }
      })

      // Build suggestions with relevance scores
      const suggestions = []

      // Product suggestions
      products.forEach(product => {
        const score = calculateRelevanceScore(product, query, 'product')
        suggestions.push({
          id: `product-${product.id}`,
          type: 'product',
          title: product.name,
          subtitle: product.category?.name,
          image: product.images?.[0],
          url: `/products/${product.id}`,
          score,
          popularity: product._count.orders
        })
      })

      // Category suggestions
      categories.forEach(category => {
        const score = calculateRelevanceScore(category, query, 'category')
        suggestions.push({
          id: `category-${category.id}`,
          type: 'category',
          title: category.name,
          subtitle: `${category._count.products} products`,
          url: `/products?category=${category.slug}`,
          score
        })
      })

      // Tag suggestions
      tags.forEach(tag => {
        const score = calculateRelevanceScore(tag, query, 'tag')
        suggestions.push({
          id: `tag-${tag.id}`,
          type: 'tag',
          title: tag.name,
          subtitle: `${tag._count.products} products`,
          url: `/products?tags=${tag.name}`,
          score
        })
      })

      // Brand suggestions
      brands.forEach((count, brand) => {
        const score = calculateRelevanceScore({ name: brand }, query, 'brand')
        if (score > 2) { // Only include relevant brand matches
          suggestions.push({
            id: `brand-${brand}`,
            type: 'brand',
            title: brand,
            subtitle: `${count} products`,
            url: `/products?brand=${encodeURIComponent(brand)}`,
            score
          })
        }
      })

      // Query completion suggestions
      const querySuggestions = generateQuerySuggestions(query)
      querySuggestions.forEach((suggestion, index) => {
        suggestions.push({
          id: `query-${index}`,
          type: 'query',
          title: suggestion,
          subtitle: 'Search suggestion',
          url: `/products?q=${encodeURIComponent(suggestion)}`,
          score: 50 - index // Decreasing score for alternatives
        })
      })

      // Sort by relevance score and limit
      suggestions.sort((a, b) => b.score - a.score)
      const limitedSuggestions = suggestions.slice(0, limit)

      return NextResponse.json({
        success: true,
        suggestions: limitedSuggestions
      })

    } catch (error) {
      console.error('Search suggestions error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch suggestions'
        },
        { status: 500 }
      )
    }
  }
)

// Generate query completion suggestions
function generateQuerySuggestions(query: string): string[] {
  const suggestions = []
  
  // Common prefixes and suffixes
  const prefixes = ['men', 'women', 'kids', 'boys', 'girls']
  const suffixes = ['shirt', 'pants', 'shoes', 'jacket', 'dress', 'hat', 'bag']
  
  // Try combining with prefixes
  prefixes.forEach(prefix => {
    if (query.toLowerCase().startsWith(prefix)) {
      suffixes.forEach(suffix => {
        suggestions.push(`${prefix} ${suffix}`)
      })
    }
  })
  
  // Try combining with suffixes
  suffixes.forEach(suffix => {
    if (query.toLowerCase().endsWith(suffix)) {
      prefixes.forEach(prefix => {
        suggestions.push(`${prefix} ${suffix}`)
      })
    }
  })
  
  // Common variations
  const variations = [
    `${query} for men`,
    `${query} for women`,
    `${query} for kids`,
    `cheap ${query}`,
    `best ${query}`,
    `${query} sale`,
    `${query} discount`
  ]
  
  suggestions.push(...variations)
  
  // Remove duplicates and return
  return [...new Set(suggestions)].slice(0, 5)
}
