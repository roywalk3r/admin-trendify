import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import CategoryProducts from "@/components/category-products"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

interface CategoryPageProps {
  params: { slug: string }
}

async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, image: true, description: true },
    })
    return category
  } catch (e) {
    return null
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)
  if (!category) {
    return { title: "Category Not Found | Trendify" }
  }
  return {
    title: `${category.name} | Categories | Trendify`,
    description: category.description || `Explore ${category.name} products on Trendify`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug)
  if (!category) return notFound()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
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
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mb-8">{category.description}</p>
      )}

      {/* Products filtered by this category via props (slug/id) and query param */}
      <CategoryProducts slug={category.slug} categoryId={category.id} />
    </div>
  )
}

