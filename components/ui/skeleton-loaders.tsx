import { Skeleton } from "@/components/ui/skeleton"

interface ProductCardSkeletonProps {
  count?: number
}

export function ProductCardSkeleton({ count = 1 }: ProductCardSkeletonProps) {
  return (
    <div className={`space-y-4 ${count > 1 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="group relative bg-card rounded-2xl border border-muted overflow-hidden shadow-md">
          {/* Image Skeleton */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title Skeleton */}
            <Skeleton className="h-5 w-3/4" />
            
            {/* Rating Skeleton */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-4 h-4" />
                ))}
              </div>
              <Skeleton className="h-4 w-8" />
            </div>

            {/* Price Skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Button Skeleton */}
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4 flex-wrap">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-10 w-32" />
        ))}
      </div>

      {/* Product Grid Skeleton */}
      <ProductCardSkeleton count={8} />
    </div>
  )
}
