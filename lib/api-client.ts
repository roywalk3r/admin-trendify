import { z } from "zod"

// Define response types using Zod schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.union([z.number(), z.string()]).transform((val) => (typeof val === "string" ? Number.parseFloat(val) : val)),
  inventory: z.number(),
  images: z.array(z.string()),
  categoryId: z.string(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    })
    .optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

const ProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
})

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string(),
  imageUrl: z.string().nullable().optional(),
})

const CategoriesResponseSchema = z.array(CategorySchema)

// Type definitions
export type Product = z.infer<typeof ProductSchema>
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>
export type Category = z.infer<typeof CategorySchema>
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>

// API client with type safety
export const apiClient = {
  // Products
  async getProducts(params: {
    categoryId?: string
    query?: string
    page?: number
    limit?: number
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams()

    if (params.categoryId) searchParams.set("categoryId", params.categoryId)
    if (params.query) searchParams.set("query", params.query)
    if (params.page) searchParams.set("page", params.page.toString())
    if (params.limit) searchParams.set("limit", params.limit.toString())

    const response = await fetch(`/api/products?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return ProductsResponseSchema.parse(data)
  },

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`/api/products/${id}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return ProductSchema.parse(data)
  },

  // Categories
  async getCategories(): Promise<CategoriesResponse> {
    const response = await fetch("/api/categories")

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return CategoriesResponseSchema.parse(data)
  },

  // Add more API methods as needed...
}
