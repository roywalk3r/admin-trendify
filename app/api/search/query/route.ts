import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = (url.searchParams.get("q") || "").trim()
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1)
    const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") || "12", 10), 1), 50)
    const categoryParam = (url.searchParams.get("category") || "").trim()
    const minPriceParam = (url.searchParams.get("min") || "").trim()
    const maxPriceParam = (url.searchParams.get("max") || "").trim()
    const inStockParam = (url.searchParams.get("inStock") || "").trim().toLowerCase()

    if (!q || q.length < 2) {
      return createApiResponse({ data: { products: [], total: 0, page, pageSize } })
    }

    const qLower = q.toLowerCase()
    const synonymMap: Record<string, string[]> = {
      laptop: [
        "notebook",
        "ultrabook",
        "computer",
        "pc",
        "xps",
        "xps13",
        "xp13",
        "macbook",
        "thinkpad",
        "dell",
        "lenovo",
        "hp",
      ],
      phone: ["smartphone", "mobile"],
      tv: ["television", "oled", "lcd"],
      shoes: ["sneakers", "trainers"],
    }
    const synonyms = synonymMap[qLower] || []
    const tokens = qLower.split(/\s+/).filter(Boolean)
    const terms = Array.from(new Set([qLower, ...tokens, ...synonyms]))

    const where: any = {
      AND: [
        { isActive: true },
        { isDeleted: false },
        { status: "active" as const },
        {
          OR: terms.flatMap((term) => [
            { name: { contains: term, mode: "insensitive" } },
            { slug: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { category: { is: { name: { contains: term, mode: "insensitive" } } } },
            { tags: { some: { tag: { is: { name: { contains: term, mode: "insensitive" } } } } } },
          ]),
        },
      ],
    }

    // Apply filters
    if (categoryParam) {
      where.AND.push({
        OR: [
          { category: { is: { name: { contains: categoryParam, mode: "insensitive" } } } },
          { category: { is: { slug: { contains: categoryParam, mode: "insensitive" } } } },
        ],
      })
    }
    const minVal = minPriceParam && !isNaN(Number(minPriceParam)) ? Number(minPriceParam) : null
    const maxVal = maxPriceParam && !isNaN(Number(maxPriceParam)) ? Number(maxPriceParam) : null
    if (minVal !== null || maxVal !== null) {
      where.AND.push({
        price: {
          ...(minVal !== null ? { gte: minVal } : {}),
          ...(maxVal !== null ? { lte: maxVal } : {}),
        },
      })
    }
    if (inStockParam === "true") {
      where.AND.push({ stock: { gt: 0 } })
    }

    // Fetch more than a page to compute simple relevance ranking
    const takeForRank = Math.min(pageSize * 3, 60)
    const [total, raw] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          category: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
          shortDesc: true,
          description: true,
          tags: { select: { tag: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: takeForRank,
      }),
    ])

    // Simple client-side relevance scoring
    const scoreText = (text: string | null | undefined, weightContains = 1, weightExact = 2) => {
      if (!text) return 0
      const t = text.toLowerCase()
      let s = 0
      if (t.includes(qLower)) s += weightContains
      for (const tok of tokens) if (tok && t.includes(tok)) s += weightContains
      if (t === qLower) s += weightExact
      return s
    }

    const ranked = raw
      .map((p) => {
        const catName = p.category?.name || ""
        const tagNames = p.tags?.map((t) => t.tag.name) || []
        let score = 0
        score += scoreText(p.name, 5, 8)
        score += scoreText(p.slug, 4, 6)
        score += scoreText(catName, 2, 3)
        score += scoreText(p.description || p.shortDesc || "", 1, 2)
        for (const tn of tagNames) score += scoreText(tn, 2, 3)
        // Boost brands/known laptop terms
        const boosts = ["dell", "lenovo", "hp", "xps", "thinkpad", "macbook"]
        for (const b of boosts) {
          if ((p.name || "").toLowerCase().includes(b)) score += 2
        }
        return { p, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
      .map(({ p }) => p)

    const items = ranked.map((p) => {
      const ratings = p.reviews.map((r) => r.rating)
      const averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0] || "/placeholder.svg",
        price: Number(p.price as any),
        category: p.category?.name || null,
        averageRating,
        reviewCount: ratings.length,
        shortDesc: p.shortDesc || null,
      }
    })

    return createApiResponse({ data: { products: items, total, page, pageSize } })
  } catch (error) {
    return handleApiError(error)
  }
}
