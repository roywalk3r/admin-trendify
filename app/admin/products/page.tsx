"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus, Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppwriteImg } from "@/components/appwrite/appwrite-img"
import type { Product } from "@/types/product"

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/products")
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()

        // Log the response to help debug
        console.log("Products API response:", data)

        // Handle the specific structure where products are nested under data.products
        if (data.data && data.data.products && Array.isArray(data.data.products)) {
          setProducts(data.data.products)
        } else if (data.data && Array.isArray(data.data)) {
          setProducts(data.data)
        } else {
          console.error("Unexpected data structure:", data)
          setProducts([])
        }
      } catch (error) {
        toast.error("Failed to load products")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const confirmDelete = (product: Product) => {
    setProductToDelete(product)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      })

      const body = await response.json()
      console.log("Delete API Response:", body)

      if (!response.ok) {
        throw new Error(body?.error || "Failed to delete product")
      }

      setProducts(products.filter((p) => p.id !== productToDelete.id))
      toast.success("Product deleted successfully")
      setProductToDelete(null)
    } catch (error) {
      toast.error("Failed to delete product")
      console.error("Frontend delete error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button variant={"link"} onClick={() => router.push("/admin/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 w-full md:w-96"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? "Try a different search term" : "Add your first product to get started"}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <AppwriteImg
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log(`Navigating to edit product: ${product.id}`)
                          router.push(`/admin/products/${product.id}/edit`)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(product)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
