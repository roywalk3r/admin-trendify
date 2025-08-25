"use client"

import ProductCard from "@/components/product-card"
import { useApi } from "@/lib/hooks/use-api"

interface RelatedProductsProps {
  productId: string
  categoryId: string | null
}

export function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const { data, isLoading, error } = useApi<{
    products: Array<{
      id: string
      name: string
      price: number
      images: string[]
      averageRating?: number
      reviewCount?: number
    }>
    pagination: any
  }>(`/api/products?limit=4&exclude=${encodeURIComponent(productId)}${categoryId ? `&categoryId=${encodeURIComponent(categoryId)}` : ""}`)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg aspect-square mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) return null

  const list = data?.products ?? []

  if (list.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {list.map((p, index) => (
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
  )
}
