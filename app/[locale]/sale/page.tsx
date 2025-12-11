import HeroCard from "@/components/hero-card"
import FilterSortBar from "@/components/filter-sort-bar"
import ProductCard from "@/components/product-card"
import { headers } from "next/headers"
import { Suspense } from "react"

async function fetchSale() {
  const hdrs = await headers()
  const host = hdrs.get("host")
  const proto = process.env.VERCEL_URL ? "https" : "http"
  const url = host ? `${proto}://${host}/api/sale` : `/api/sale`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return { items: [], discountPercent: 0, endsAt: null }
  const json = await res.json()
  return json.data as { items: Array<{ id: string; name: string; slug: string; image: string | null; price: number; originalPrice: number; discountPercent: number }>; discountPercent: number; endsAt: string | null }
}

export default async function SalePage() {
  const sale = await fetchSale()
  const items = sale.items || []

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-8">
        <HeroCard
          title={"Sale Collection"}
          image="/images/banner.png"
          position="items-left"
          cta="Shop Sale"
          text="Don't miss out on incredible savings! Discover amazing deals on your favorite fashion pieces. Limited time only!"
          style="italic typography"
        />
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading filters…</div>}>
          <FilterSortBar />
        </Suspense>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Showing {items.length} sale items</span>
              {sale.discountPercent > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                  Up to {sale.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((p, idx) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                image={p.image || "/placeholder.svg"}
                rating={0}
                reviews={0}
                isSale
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
