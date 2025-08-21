import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProductDetail from "@/components/product-detail"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import prisma from "@/lib/prisma"

interface ProductPageProps {
  params: { id: string }
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: { select: { rating: true } },
    },
  })
  return product
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: "Product Not Found | Trendify",
      description: "The product you're looking for could not be found.",
    }
  }

  return {
    title: `${product.name} | Trendify`,
    description: product.description ?? "",
    openGraph: {
      title: `${product.name} | Trendify`,
      description: product.description ?? "",
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Trendify`,
      description: product.description ?? "",
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-muted bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/products">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                  </Button>
                </Link>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-ascent">{product.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8">
          {/* Map DB product to the UI shape expected by ProductDetail */}
          {(() => {
            const ratings = product.reviews ?? []
            const reviewsCount = ratings.length
            const avgRating = reviewsCount
              ? ratings.reduce((sum, r) => sum + (Number((r as any).rating) || 0), 0) / reviewsCount
              : 0

            const uiProduct = {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              originalPrice: product.comparePrice ? Number(product.comparePrice) : undefined,
              images: product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"],
              rating: avgRating,
              reviews: reviewsCount,
              description: product.description ?? "",
              features: [] as string[],
              sizes: [] as string[],
              colors: [] as string[],
              category: (product as any).category?.name ?? "",
              brand: (product as any).category?.name ?? "",
              sku: product.sku ?? "",
              inStock: product.stock > 0,
              stockCount: product.stock,
              isNew: false,
              isSale: !!(product.comparePrice && Number(product.comparePrice) > Number(product.price)),
            }
            return (
              <>
                <ProductDetail product={uiProduct as any} />
                <ReviewsSection productId={product.id} />
              </>
            )
          })()}
        </main>
      </div>
  )
}
