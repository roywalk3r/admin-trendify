"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const featuredProducts = [
  {
    id: 1,
    name: "Product 1",
    image: "/p1.jpg",
    rating: 4,
    reviews: 120,
    price: 29.99,
  },
  {
    id: 2,
    name: "Product 2",
    image: "/p1.jpg",
    rating: 5,
    reviews: 98,
    price: 49.99,
  },
  {
    id: 3,
    name: "Product 3",
    image: "/p1.jpg",
    rating: 3,
    reviews: 75,
    price: 19.99,
  },
  {
    id: 4,
    name: "Product 4",
    image: "/p1.jpg",
    rating: 4,
    reviews: 200,
    price: 39.99,
  },
]

export default function FeaturedProducts() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Products</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover our most popular items loved by customers worldwide.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {featuredProducts.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group">
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover transition-transform group-hover:scale-105"
                    fill
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg group-hover:underline">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < product.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <div className="font-bold">${product.price.toFixed(2)}</div>
                  <Button size="sm" variant="ghost">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to cart
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
