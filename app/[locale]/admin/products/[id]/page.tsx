"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Edit, Trash2, ArrowLeft, Star, Package, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SafeHtml from "@/components/safe-html"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: string
  stock: number
  categoryId: string
  category: {
    id: string
    name: string
  }
  images: string[]
  isActive: boolean
  isFeatured: boolean
  status: string
  createdAt: string
  updatedAt: string
  reviewCount?: number
  orderCount?: number
  slug?: string
}

export default function ProductViewPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

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
        } else if (data) {
          setProduct(data)
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

  const handleDelete = async () => {
    if (!product) return

    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Product deleted successfully")
        router.push("/admin/products")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

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
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Product not found</h2>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {product.isFeatured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
            </div>
            <p className="text-muted-foreground">Product ID: {product.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            {product.images && product.images.length > 0 ? (
              <div className="grid gap-4">
                <div className="aspect-square overflow-hidden rounded-lg border">
                  <Image
                    src={product.images[0] || "/placeholder.svg?height=400&width=400"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded border">
                        <Image
                          src={image || "/placeholder.svg?height=100&width=100"}
                          alt={`${product.name} ${index + 2}`}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center border rounded-lg bg-muted">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No images available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="mt-1 prose prose-sm max-w-none text-muted-foreground">
                  <SafeHtml html={product.description} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-2xl font-bold">${product.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock</label>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{product.stock}</p>
                    {product.stock < 10 && <AlertCircle className="h-4 w-4 text-orange-500" />}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <div className="mt-1">
                  <Badge variant="outline">{product.category?.name || "No Category"}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Featured</label>
                  <div className="mt-1">
                    <Badge variant={product.isFeatured ? "default" : "outline"}>
                      {product.isFeatured ? "Featured" : "Not Featured"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reviews</label>
                  <p className="text-xl font-semibold">{product.reviewCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Orders</label>
                  <p className="text-xl font-semibold">{product.orderCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p>{new Date(product.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p>{new Date(product.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
