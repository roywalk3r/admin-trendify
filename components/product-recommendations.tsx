"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppwriteImage } from "@/components/appwrite/appwrite-image"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/types/product"

interface ProductRecommendationsProps {
  productId?: string
  type?: "similar" | "viewed" | "purchased"
  title?: string
  limit?: number
}

export function ProductRecommendations({
  productId,
  type = "similar",
  title = "You might also like",
  limit = 4,
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        if (productId) params.append("productId", productId)
        if (type) params.append("type", type)
        if (limit) params.append("limit", limit.toString())

        const response = await fetch(`/api/recommendations?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }

        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [productId, type, limit])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array(limit)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-sm text-muted-foreground">Unable to load recommendations</div>
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button variant="link" asChild>
          <Link href="/products">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id} className="group">
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-square overflow-hidden">
                <AppwriteImage
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate group-hover:text-primary">{product.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{product.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div className="font-bold">${Number(product.price).toFixed(2)}</div>
                <Badge variant={product.stock > 0 ? "outline" : "destructive"} className="text-xs">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
