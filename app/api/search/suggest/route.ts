import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = (url.searchParams.get("q") || "").trim()
    const limit = Math.min(Number(url.searchParams.get("limit") || 8), 20)

    if (!q) {
      return createApiResponse({ data: { suggestions: [] }, status: 200 })
    }

    // Basic synonym expansion (helps queries like "laptop" match products like "Dell XPS 13")
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

    // Search across multiple fields: name, slug, description, category name, tag names
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          { isDeleted: false },
          { status: "active" },
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
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: { select: { name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const suggestions = products.map((p) => {
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
      }
    })

    return createApiResponse({ data: { suggestions }, status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
