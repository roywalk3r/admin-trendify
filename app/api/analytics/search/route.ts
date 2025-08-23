import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import type { NextRequest } from "next/server"
import { isAdmin } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}))
    const {
      query = "",
      resultCount = 0,
      aiSuggested = false,
      clickedSuggestion = null,
      source = "unknown",
    }: {
      query?: string
      resultCount?: number
      aiSuggested?: boolean
      clickedSuggestion?: string | null
      source?: "popup" | "page" | string
    } = json || {}

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null
    const userAgent = req.headers.get("user-agent") || null

    // Persist using Audit model to avoid a new migration
    await prisma.audit.create({
      data: {
        action: "search_event",
        entityType: "search",
        entityId: (query || "").slice(0, 100) || "unknown",
        userId: null,
        userEmail: null,
        oldValue: Prisma.JsonNull,
        newValue: {
          query,
          resultCount,
          aiSuggested,
          clickedSuggestion,
          source,
          ip,
          userAgent,
          ts: new Date().toISOString(),
        },
        ipAddress: ip ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    })

    return createApiResponse({ data: { ok: true } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin()
    const isDev = process.env.NODE_ENV !== "production"
    if (!admin && !isDev) {
      return createApiResponse({ error: "Forbidden", status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const days = Number(searchParams.get("days") || 30)
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (isNaN(days) ? 30 : days))

    const rows = await prisma.audit.findMany({
      where: {
        action: "search_event",
        createdAt: { gte: from, lte: to },
      },
      select: { newValue: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5000, // safety cap
    })

    let total = 0
    let zeroResults = 0
    let aiAssists = 0
    let suggestionClicks = 0

    const queryCounts = new Map<string, number>()
    const zeroQueryCounts = new Map<string, number>()
    const clickedSuggestionCounts = new Map<string, number>()
    const byDay = new Map<string, { total: number; zero: number }>()

    const dayKey = (d: Date) => d.toISOString().slice(0, 10)

    for (const r of rows) {
      total += 1
      const nv: any = r.newValue || {}
      const q = typeof nv.query === "string" ? nv.query.trim() : ""
      const rc = typeof nv.resultCount === "number" ? nv.resultCount : Number(nv.resultCount ?? 0)
      const assisted = Boolean(nv.aiSuggested)
      const clicked = typeof nv.clickedSuggestion === "string" && nv.clickedSuggestion.length > 0

      if (q) queryCounts.set(q, (queryCounts.get(q) || 0) + 1)
      if (rc === 0 && q) zeroQueryCounts.set(q, (zeroQueryCounts.get(q) || 0) + 1)
      if (assisted) aiAssists += 1
      if (clicked) {
        suggestionClicks += 1
        const text = String(nv.clickedSuggestion)
        clickedSuggestionCounts.set(text, (clickedSuggestionCounts.get(text) || 0) + 1)
      }

      if (rc === 0) zeroResults += 1

      const k = dayKey(r.createdAt)
      const entry = byDay.get(k) || { total: 0, zero: 0 }
      entry.total += 1
      if (rc === 0) entry.zero += 1
      byDay.set(k, entry)
    }

    const topQueries = Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }))

    const zeroResultTop = Array.from(zeroQueryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }))

    const clickedSuggestionsTop = Array.from(clickedSuggestionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([text, count]) => ({ text, count }))

    const timeseries = Array.from(byDay.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, v]) => ({ date, total: v.total, zeroResults: v.zero }))

    return createApiResponse({
      data: {
        summary: { total, zeroResults, aiAssists, suggestionClicks },
        topQueries,
        zeroResultTop,
        clickedSuggestionsTop,
        timeseries,
        range: { from, to },
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
