"use client"

import HeroCard from "@/components/hero-card"
import FilterSortBar from "@/components/filter-sort-bar"
import { all_products } from "@/lib/data"
import Image from "next/image";
import {useApi} from "@/lib/use-api";
import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/product-card";

export default function WomenPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
            <WomenContent />
        </Suspense>
    )
}

function WomenContent() {
    const searchParams = useSearchParams()

    const apiUrl = useMemo(() => {
        const sp = new URLSearchParams()
        // preserve supported params
        const limit = searchParams.get("limit") || "12"
        const sort = searchParams.get("sort") || "createdAt-desc"
        const page = searchParams.get("page") || "1"
        const search = searchParams.get("search") || ""
        if (limit) sp.set("limit", limit)
        if (sort) sp.set("sort", sort)
        if (page) sp.set("page", page)
        if (search) sp.set("search", search)
        // fixed category for women section
        sp.set("category", "womens-clothing")
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


    const womenProducts = all_products?.products ?? []// Filter products for women's category

    return (
        <>
            <div className="w-full max-w-7xl mx-auto p-8">
                <HeroCard
                    title={"Women's Collection"}
                    image="/images/hero3.jpg"
                    position="items-left"
                    cta="Explore Now"
                    text="Embrace your femininity with our curated collection of women's fashion. From elegant dresses to casual chic, discover pieces that celebrate your unique style."
                    style="italic typography"
                />
                <FilterSortBar fixedCategory="womens-clothing" />

                {/* Custom Products Grid for Women */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Showing {all_products?.pagination?.total ?? womenProducts.length} women&apos;s products</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(womenProducts || []).map((p, index) => (
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
