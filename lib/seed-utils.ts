import { PrismaClient } from "@/prisma/generated/client"

const prisma = new PrismaClient()

/**
 * Seed the database with initial data
 * This is a utility function that can be called from an API route
 */
export async function seedDatabase() {
  try {
    // Clean up existing data
    await prisma.wishlistItem.deleteMany({})
    await prisma.wishlist.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.shippingAddress.deleteMany({})
    await prisma.orderItem.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.review.deleteMany({})
    await prisma.address.deleteMany({})
    await prisma.product.deleteMany({})
    await prisma.category.deleteMany({})

    // Don't delete users as they are linked to Clerk
    // Just update the admin role if needed

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Electronics",
          slug: "electronics",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.create({
        data: {
          name: "Clothing",
          slug: "clothing",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.create({
        data: {
          name: "Home & Kitchen",
          slug: "home-kitchen",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
      prisma.category.create({
        data: {
          name: "Beauty",
          slug: "beauty",
          image: "/placeholder.svg?height=200&width=300",
        },
      }),
    ])

    // Create products
    const electronicsProducts = [
      {
        name: "Wireless Headphones",
        description: "Premium wireless headphones with noise cancellation and long battery life.",
        price: 129.99,
        stock: 50,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[0].id,
      },
      {
        name: "Smart Watch",
        description: "Track your fitness, receive notifications, and more with this smart watch.",
        price: 199.99,
        stock: 30,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[0].id,
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with amazing sound quality and water resistance.",
        price: 79.99,
        stock: 45,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[0].id,
      },
    ]

    const clothingProducts = [
      {
        name: "Cotton T-Shirt",
        description: "Comfortable cotton t-shirt available in various colors.",
        price: 24.99,
        stock: 100,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[1].id,
      },
      {
        name: "Slim Fit Jeans",
        description: "Classic slim fit jeans that go with everything.",
        price: 49.99,
        stock: 75,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[1].id,
      },
    ]

    const homeProducts = [
      {
        name: "Coffee Maker",
        description: "Programmable coffee maker with thermal carafe.",
        price: 89.99,
        stock: 35,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[2].id,
      },
      {
        name: "Kitchen Mixer",
        description: "Powerful stand mixer for all your baking needs.",
        price: 249.99,
        stock: 20,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[2].id,
      },
    ]

    const beautyProducts = [
      {
        name: "Face Moisturizer",
        description: "Hydrating face moisturizer for all skin types.",
        price: 34.99,
        stock: 60,
        images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
        category_id: categories[3].id,
      },
    ]

    // Combine all products
    const allProducts = [...electronicsProducts, ...clothingProducts, ...homeProducts, ...beautyProducts]

    // Create products in database
    await Promise.all(
      allProducts.map((product) =>
        prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            images: product.images,
            categoryId: product.category_id,
            slug: product.name.toLowerCase().replace(/ /g, "-"),
          },
        }),
      ),
    )

    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, message: "Error seeding database", error }
  } finally {
    await prisma.$disconnect()
  }
}
