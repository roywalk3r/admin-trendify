import { notFound } from "next/navigation"
import { all_products } from "@/lib/data"
import ProductDetail from "@/components/product-detail"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  const product = all_products.find((p) => p.id === id)
  return product || null
}

export async function generateStaticParams() {
  return all_products.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} | Trendify`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}
