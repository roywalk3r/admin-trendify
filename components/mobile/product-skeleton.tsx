"use client";

export function ProductSkeleton() {
  return (
    <div className="bg-card rounded-xl border overflow-hidden animate-pulse">
      {/* Image */}
      <div className="aspect-square bg-muted" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-12" />
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-muted rounded flex-1" />
          <div className="h-10 bg-muted rounded w-10" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
