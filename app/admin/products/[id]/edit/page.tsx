"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ProductForm } from "@/components/product-form"
import type { Product } from "@/types/product"

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        console.log(`Fetching product with ID: ${params.id}`)
        const response = await fetch(`/api/admin/products/${params.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Product data received:", data)

        if (data.data) {
          setProduct(data.data)
        } else {
          throw new Error("Invalid data structure received from API")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast.error(`Failed to load product: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Product not found</h2>
          <p className="text-muted-foreground">The product you're trying to edit doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <ProductForm initialData={product} isEditing={true} />
    </div>
  )
}
