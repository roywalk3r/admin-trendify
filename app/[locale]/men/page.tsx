"use client"

import HeroCard from "@/components/hero-card"
import FilterSortBar from "@/components/filter-sort-bar"
import ProductCard from "@/components/product-card";
import {useApi} from "@/lib/use-api";
import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"

export default function MenPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
            <MenContent />
        </Suspense>
    )
}

function MenContent() {
    const searchParams = useSearchParams()

    const apiUrl = useMemo(() => {
        const sp = new URLSearchParams()
        const limit = searchParams.get("limit") || "12"
        const sort = searchParams.get("sort") || "createdAt-desc"
        const page = searchParams.get("page") || "1"
        const search = searchParams.get("search") || ""
        if (limit) sp.set("limit", limit)
        if (sort) sp.set("sort", sort)
        if (page) sp.set("page", page)
        if (search) sp.set("search", search)
        sp.set("category", "mens-clothing")
        return `/api/products?${sp.toString()}`
    }, [searchParams])

    const {data:all_products, isLoading, error} = useApi<{
        products: Array<{
            id: string
            name: string
            price: number
            images: string[]
            averageRating?: number
            reviewCount?: number
        }>
        pagination: any
    }>(apiUrl)

    const menProducts = all_products?.products ?? []

    return (
        <>
            <div className="w-full max-w-7xl mx-auto p-8">
                <HeroCard
                    title={"Men's Collection"}
                    image="/images/men.jpg"
                    position="items-left"
                    cta="Shop Now"
                    text="Discover our premium collection of men's fashion. From casual wear to formal attire, find everything you need to elevate your style."
                    style="italic typography"
                />
                <FilterSortBar fixedCategory="mens-clothing" />

                {/* Custom Products Grid for Men */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
                        <div className="flex items-center gap-4">
                            {isLoading && (
                                <span className="text-sm text-muted-foreground">Loading men&apos;s products…</span>
                            )}
                            {!isLoading && (
                                <span className="text-sm text-muted-foreground">Showing {all_products?.pagination?.total ?? menProducts.length} men&apos;s products</span>
                            )}
                            {error && (
                                <span className="text-sm text-destructive">{error}</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(menProducts || []).map((p, index) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                name={p.name}
                                price={Number((p as any).price)}
                                originalPrice={undefined}
                                image={p.images?.[0] || "/placeholder.svg"}
                                rating={p.averageRating || 0}
                                reviews={p.reviewCount || 0}
                                isNew={false}
                                isSale={false}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
