import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import Categories from "@/components/categories"

export const revalidate = 300

export const metadata: Metadata = {
  title: "All Categories | Trendify",
  description: "Browse all product categories on Trendify",
}

async function getCategories() {
  try {
    const items = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, image: true },
    })
    return items
  } catch {
    return []
  }
}

export default async function CategoriesIndexPage() {
  const categories = await getCategories()
  return (
    <div className="container">
      <Categories categories={categories} />
    </div>
  )
}
