import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { ProductDetail } from "@/components/product-detail"
import { ReviewList } from "@/components/reviews/review-list"
import { RelatedProducts } from "@/components/related-products"
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
import { prisma } from "@/lib/prisma"
import { getProductByIdCached } from "@/lib/data/products"
import { SettingsProvider } from "@/contexts/settings-context"
import {Review} from "@/prisma/generated/client";

export const revalidate = 300

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    // Use cached helper for read-through caching
    const product = await getProductByIdCached(id)

    if (!product) return null

    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const { id } = params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: "Product Not Found | Trendify",
      description: "The product you're looking for could not be found.",
    }
  }

  const metaTitle = (product as any)?.seoTitle || `${product.name} | Trendify`
  const metaDescription = (product as any)?.seoDesc || product.description || ""
  const tagNames = Array.isArray((product as any)?.tags)
    ? ((product as any).tags as any[]).map((pt) => pt?.tag?.name).filter(Boolean)
    : []
  const keywords = tagNames.length ? tagNames.join(", ") : undefined

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    openGraph: {
      title: metaTitle || product.name,
      description: metaDescription,
      images: (product.images || []).slice(0, 4).map((image: string) => ({
        url: image,
        alt: product.name,
      })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle || product.name,
      description: metaDescription,
      images: (product.images || []).slice(0, 4),
    },
  }
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const { id } = params
  const product = await getProduct(id)
  const { userId } = await auth()

  if (!product) {
    notFound()
  }

  const averageRating =
      product.reviews.length > 0
          ? product.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / product.reviews.length
          : 0

  // Map DB product to UI-friendly shape
  const productWithRating = {
    ...product,
    // numbers
    price: Number((product as any).price),
    comparePrice: (product as any).comparePrice != null ? Number((product as any).comparePrice) : null,
    weight: (product as any).weight != null ? Number((product as any).weight) : null,
    // counts and computed
    averageRating,
    reviewCount: product._count.reviews,
    wishlistCount: product._count.wishlistItems,
    // tags relation -> string[]
    tags: Array.isArray((product as any).tags)
      ? ((product as any).tags as any[]).map((pt) => pt?.tag?.name).filter(Boolean)
      : [],
    // map threshold naming from schema lowStockAlert
    lowStockThreshold: (product as any).lowStockAlert ?? undefined,
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Enhanced sticky header with glass morphism */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <Link href="/products">
                  <Button variant="ghost" size="sm" className="gap-2 hover:gap-3 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Products</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                </Link>
                <div className="hidden md:block">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="hover:text-primary transition-colors">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/products" className="hover:text-primary transition-colors">Products</BreadcrumbLink>
                      </BreadcrumbItem>
                      {product.category && (
                          <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbLink href={`/categories/${product.category.slug}`} className="hover:text-primary transition-colors">
                                {product.category.name}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                          </>
                      )}
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-primary font-medium">{product.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SettingsProvider>
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Main product section */}
            <div className="bg-background rounded-2xl shadow-lg border border-border/50 p-6 lg:p-10 mb-8">
              <ProductDetail product={productWithRating as any} />
            </div>

            {/* Specifications section */}
            {(product.weight || product.dimensions || product.sku) && (
              <div className="bg-background rounded-2xl shadow-lg border border-border/50 p-6 lg:p-10 mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-8 bg-primary rounded-full"></span>
                  Technical Specifications
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.weight && (
                    <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground block mb-1">Weight</span>
                      <span className="font-semibold text-lg">{Number(product.weight)}g</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground block mb-1">Dimensions</span>
                      <span className="font-semibold text-lg">{typeof product.dimensions === "string" ? product.dimensions : JSON.stringify(product.dimensions)}</span>
                    </div>
                  )}
                  {product.sku && (
                    <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground block mb-1">SKU</span>
                      <span className="font-semibold text-lg">{product.sku}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews section */}
            <div className="bg-background rounded-2xl shadow-lg border border-border/50 p-6 lg:p-10 mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-8 flex items-center gap-2">
                <span className="w-1 h-8 bg-primary rounded-full"></span>
                Customer Reviews & Ratings
              </h2>
              <ReviewList productId={product.id} currentUserId={userId ?? undefined} />
            </div>

            {/* Related products section */}
            <div className="bg-background rounded-2xl shadow-lg border border-border/50 p-6 lg:p-10">
              <h2 className="text-2xl lg:text-3xl font-bold mb-8 flex items-center gap-2">
                <span className="w-1 h-8 bg-primary rounded-full"></span>
                You May Also Like
              </h2>
              <RelatedProducts productId={product.id} categoryId={product.categoryId} />
            </div>
          </main>
        </SettingsProvider>
      </div>
  )
}
