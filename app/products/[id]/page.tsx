import { notFound } from "next/navigation"
import type { Metadata } from "next"
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
import { SettingsProvider } from "@/contexts/settings-context"

interface ProductPageProps {
  params: { id: string }
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: { rating: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        tags: {
          include: { tag: { select: { name: true, slug: true } } },
        },
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
          },
        },
      },
    })

    if (!product) return null

    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
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
      images: (product.images || []).slice(0, 4).map((image) => ({
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const averageRating =
      product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
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
                    {product.category && (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbLink href={`/categories/${product.category.slug}`}>
                              {product.category.name}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        </>
                    )}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-accent">{product.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </div>
        <SettingsProvider>
          <main className="container mx-auto px-4 py-12">
            <ProductDetail product={productWithRating as any} />

          {(product.weight || product.dimensions || product.sku) && (
            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Specifications</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {product.weight && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Weight</span>
                    <span>{Number(product.weight)}g</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Dimensions</span>
                    <span>{typeof product.dimensions === "string" ? product.dimensions : JSON.stringify(product.dimensions)}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">SKU</span>
                    <span>{product.sku}</span>
                  </div>
                )}
              </div>
            </div>
          )}

            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              <ReviewList productId={product.id} />
            </div>

            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <RelatedProducts productId={product.id} categoryId={product.categoryId} />
            </div>
          </main>
        </SettingsProvider>
      </div>
  )
}
