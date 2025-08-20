import ProductCard from "@/components/product-card"
import { useApi } from "@/lib/hooks/use-api"

export default function NewArrivalProduct() {
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
  }>("/api/products?limit=9&sort=createdAt-desc")

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto p-8">
        {isLoading && (
          <div className="col-span-full text-center text-muted-foreground">Loading new arrivals...</div>
        )}
        {error && (
          <div className="col-span-full text-center text-red-500">Failed to load products: {error}</div>
        )}
        {(data?.products || []).map((p, index) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
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
    </>
  )
}