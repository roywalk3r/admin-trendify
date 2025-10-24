"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ProductsGrid from "@/components/products-grid"

export default function CategoryProducts({ slug, categoryId }: { slug: string; categoryId?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Keep URL in sync for shareability, but also pass props to avoid race conditions
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString())
    const current = sp.get("category") || sp.get("categories")
    if (current !== slug) {
      sp.set("category", slug)
      sp.delete("page")
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  return <ProductsGrid categorySlug={slug} categoryId={categoryId} />
}
