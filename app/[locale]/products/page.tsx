import ProductsGrid from "@/components/products-grid"
import ProductFilters from "@/components/product-filters"
import { Suspense } from "react"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="typography text-4xl md:text-5xl mb-4">All Products</h1>
          <p className="text-muted-foreground text-lg">
            Discover our complete collection of fashion-forward clothing and accessories
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<div>Loading filters...</div>}>
              <ProductFilters />
            </Suspense>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductsGrid />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
