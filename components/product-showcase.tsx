"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart, Heart, Star } from "lucide-react"
import { useApi } from "@/lib/hooks/use-api"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/lib/store/cart-store"
import { toast } from "sonner"

export function ProductShowcase() {
  const { data, isLoading } = useApi<any>("/api/products?limit=8")
  const [products, setProducts] = useState<any[]>([])
  const { addItem } = useCartStore()

  useEffect(() => {
    if (data?.products) {
      setProducts(data.products)
    }
  }, [data])

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item}>
          <Link href={`/products/${product.id}`} className="group block">
            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toast.success(`${product.name} added to wishlist`)
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{product.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(24)</span>
                </div>
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
    </motion.div>
  )
}
