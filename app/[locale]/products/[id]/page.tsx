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
import { SettingsProvider } from "@/lib/contexts/settings-context"
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
      robots: "noindex, nofollow",
    }
  }

  const metaTitle = (product as any)?.seoTitle || `${product.name} | Trendify`
  const metaDescription = (product as any)?.seoDesc || product.description || ""
  const tagNames = Array.isArray((product as any)?.tags)
    ? ((product as any).tags as any[]).map((pt) => pt?.tag?.name).filter(Boolean)
    : []
  const keywords = tagNames.length ? tagNames.join(", ") : undefined
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / product.reviews.length
    : 0
  const reviewCount = product._count.reviews
  const price = Number((product as any).price)
  const comparePrice = (product as any).comparePrice != null ? Number((product as any).comparePrice) : null
  const inStock = product.stock > 0

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: metaDescription,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Trendify"
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${id}`,
      priceCurrency: "USD",
      price: price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      seller: {
        "@type": "Organization",
        name: "Trendify"
      }
    },
    aggregateRating: reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: "5",
      worstRating: "1"
    } : undefined,
    category: product.category?.name,
    keywords: keywords
  }

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    robots: "index, follow",
    openGraph: {
      title: metaTitle || product.name,
      description: metaDescription,
      images: (product.images || []).slice(0, 4).map((image: string) => ({
        url: image,
        alt: product.name,
        width: 1200,
        height: 630,
      })),
      type: "website",
      siteName: "Trendify",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle || product.name,
      description: metaDescription,
      images: (product.images || []).slice(0, 4),
      creator: "@trendify",
      site: "@trendify",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/${id}`,
    },
    other: {
      "product:price:amount": price.toString(),
      "product:price:currency": "USD",
      "product:availability": inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": "Trendify",
      "product:category": product.category?.name || "",
      ...(comparePrice && { "product:sale_price": comparePrice.toString() }),
      "application/ld+json": JSON.stringify(structuredData)
    }
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
    variants: Array.isArray((product as any).variants)
      ? (product as any).variants.map((v: any) => ({
          ...v,
          price: Number(v.price),
          attributes: (v.attributes || {}) as Record<string, string>,
        }))
      : [],
    // map threshold naming from schema lowStockAlert
    lowStockThreshold: (product as any).lowStockAlert ?? undefined,
  }

  // Generate structured data for SEO
  const metaDescription = (product as any)?.seoDesc || product.description || ""
  const tagNames = Array.isArray((product as any)?.tags)
    ? ((product as any).tags as any[]).map((pt) => pt?.tag?.name).filter(Boolean)
    : []
  const keywords = tagNames.length ? tagNames.join(", ") : undefined
  const price = Number((product as any).price)
  const inStock = product.stock > 0

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: metaDescription,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Trendify"
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${id}`,
      priceCurrency: "USD",
      price: price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      seller: {
        "@type": "Organization",
        name: "Trendify"
      }
    },
    aggregateRating: product._count.reviews > 0 ? {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount: product._count.reviews,
      bestRating: "5",
      worstRating: "1"
    } : undefined,
    category: product.category?.name,
    keywords: keywords
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Enhanced sticky header with glass morphism */}
        <div className="border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
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
          <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="space-y-10 lg:space-y-12">
            {/* Main product section */}
            <section className="bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/60 p-5 sm:p-6 lg:p-10">
              <ProductDetail product={productWithRating as any} />
            </section>

            {/* Specifications section */}
            {(product.weight || product.dimensions || product.sku) && (
              <section className="bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/60 p-5 sm:p-6 lg:p-10">
                <div className="flex items-end justify-between gap-6 mb-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Technical Specifications</h2>
                    <p className="text-sm text-muted-foreground">A quick overview of dimensions and key product details.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.weight && (
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-muted-foreground block mb-1">Weight</span>
                      <span className="font-semibold text-lg">{Number(product.weight)}g</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-muted-foreground block mb-1">Dimensions</span>
                      <span className="font-semibold text-lg">{typeof product.dimensions === "string" ? product.dimensions : JSON.stringify(product.dimensions)}</span>
                    </div>
                  )}
                  {product.sku && (
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-muted-foreground block mb-1">SKU</span>
                      <span className="font-semibold text-lg">{product.sku}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Reviews section */}
            <section className="bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/60 p-5 sm:p-6 lg:p-10">
              <div className="flex items-end justify-between gap-6 mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Customer Reviews</h2>
                  <p className="text-sm text-muted-foreground">Real feedback from verified shoppers.</p>
                </div>
              </div>
              <ReviewList productId={product.id} currentUserId={userId ?? undefined} />
            </section>

            {/* Related products section */}
            <section className="bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/60 p-5 sm:p-6 lg:p-10">
              <div className="flex items-end justify-between gap-6 mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">You May Also Like</h2>
                  <p className="text-sm text-muted-foreground">More items picked based on this product’s category.</p>
                </div>
              </div>
              <RelatedProducts productId={product.id} categoryId={product.categoryId} />
            </section>
            </div>
          </main>
        </SettingsProvider>
      </div>
  )
}
