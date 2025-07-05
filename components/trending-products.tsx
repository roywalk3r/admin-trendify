"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart, TrendingUp } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/lib/store/cart-store"
import { toast } from "sonner"
import type { Product } from "@/types/product"

interface TrendingProductsProps {
  limit?: number
}

export function TrendingProducts({ limit = 4 }: TrendingProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/recommendations/trending?limit=${limit}`)

        if (!response.ok) {
          throw new Error("Failed to fetch trending products")
        }

        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error("Error fetching trending products:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingProducts()
  }, [limit])

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.images[0] || "/placeholder.svg",
    })

    toast.success(`${product.name} added to cart`)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
      <motion.section
          className="w-full py-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
      >
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
                <motion.div key={product.id} variants={item}>
                  <Link href={`/products/${product.id}`} className="group block">
                    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg border">
                      <div className="aspect-square overflow-hidden relative">
                        <img
                            src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground" variant="default">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <div className="font-bold">${Number(product.price).toFixed(2)}</div>
                        <Button
                            size="sm"
                            onClick={(e) => handleAddToCart(product, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
  )
}
