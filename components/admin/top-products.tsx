"use client"

import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminTopProducts() {
  const { data, isLoading } = useApi<any>("/api/admin/dashboard")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return <ProductsLoading />
  }

  const topProducts = data?.topProducts || []
console.log(topProducts)
  return (
    <div className="space-y-4">
      {topProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No product data available</div>
      ) : (
        <>
          {topProducts.map((item: any, index: number) => (
            <div key={item.product?.id || index} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-none">{item.product?.name || "Unknown Product"}</p>
                <p className="text-sm text-muted-foreground">{item.totalSold} units sold</p>
              </div>
              <div className="font-medium">${Number(item.product?.price)?.toFixed(2) || "0.00"}</div>
            </div>
          ))}

          <Button variant="outline" className="w-full" asChild>
            <Link href="/admin/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}

function ProductsLoading() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
    </div>
  )
}

