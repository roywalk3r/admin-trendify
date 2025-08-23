import React from "react"
import { headers } from "next/headers"

async function getData(days = 30) {
  const h = headers()
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000"
  const proto = h.get("x-forwarded-proto") || "http"
  const base = `${proto}://${host}`

  try {
    const res = await fetch(`${base}/api/analytics/search?days=${days}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      let body: any = null
      try { body = await res.json() } catch {}
      return { error: body?.error || `Request failed (${res.status})` }
    }
    return await res.json()
  } catch (e: any) {
    return { error: e?.message || "Failed to load search analytics" }
  }
}

export default async function SearchAnalyticsPage({ searchParams }: { searchParams?: { days?: string } }) {
  const days = Number(searchParams?.days ?? 30)
  const resp = await getData(isNaN(days) ? 30 : days)
  const error = (resp as any)?.error as string | undefined
  const { summary, topQueries, zeroResultTop, clickedSuggestionsTop, timeseries, range } = (resp as any)?.data || {}

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Search Analytics</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <p>
            {new Date(range?.from ?? Date.now()).toLocaleDateString()} – {new Date(range?.to ?? Date.now()).toLocaleDateString()}
          </p>
          <div className="inline-flex gap-2">
            <a className={`underline ${days === 7 ? "font-semibold" : ""}`} href="?days=7">7d</a>
            <a className={`underline ${days === 14 ? "font-semibold" : ""}`} href="?days=14">14d</a>
            <a className={`underline ${days === 30 ? "font-semibold" : ""}`} href="?days=30">30d</a>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm">
          <div className="font-medium mb-1">Unable to load analytics</div>
          <div className="text-muted-foreground">{error}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={summary?.total ?? 0} />
        <StatCard title="Zero-Result Events" value={summary?.zeroResults ?? 0} />
        <StatCard title="AI Assists" value={summary?.aiAssists ?? 0} />
        <StatCard title="Suggestion Clicks" value={summary?.suggestionClicks ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleTable
          title="Top Queries"
          rows={(topQueries ?? []).map((x: any) => ({ key: x.query, value: x.count }))}
          emptyText="No queries"
        />
        <SimpleTable
          title="Zero-Result Queries"
          rows={(zeroResultTop ?? []).map((x: any) => ({ key: x.query, value: x.count }))}
          emptyText="No zero-result queries"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleTable
          title="Clicked Suggestions"
          rows={(clickedSuggestionsTop ?? []).map((x: any) => ({ key: x.text, value: x.count }))}
          emptyText="No suggestion clicks"
        />
        <SimpleTable
          title="Daily Volume"
          rows={(timeseries ?? []).map((x: any) => ({ key: x.date, value: `${x.total} (zero: ${x.zeroResults})` }))}
          emptyText="No activity"
        />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function SimpleTable({ title, rows, emptyText }: { title: string; rows: { key: string; value: string | number }[]; emptyText: string }) {
  return (
    <div className="rounded-md border">
      <div className="px-4 py-3 border-b">
        <h2 className="font-medium">{title}</h2>
      </div>
      <div className="divide-y">
        {rows?.length ? (
          rows.map((r) => (
            <div key={`${title}-${r.key}`} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="truncate pr-3" title={r.key}>{r.key}</span>
              <span className="font-medium tabular-nums">{r.value}</span>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">{emptyText}</div>
        )}
      </div>
    </div>
  )
}
