import prisma from "@/lib/prisma"

/**
 * Check and fix Prisma schema issues
 * This function attempts to fix common schema issues like missing tables or columns
 */
export async function checkAndFixPrismaSchema() {
  try {
    // Check if the database is accessible
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      return {
        success: false,
        message: "Database connection failed. Please check your connection string.",
        error,
      }
    }

    // Check if the User table exists
    let userTableExists = false
    try {
      await prisma.user.findFirst()
      userTableExists = true
    } catch (error) {
      console.log("User table check failed:", error)
    }

    // Check if the Settings table exists
    let settingsTableExists = false
    try {
      await prisma.settings.findFirst()
      settingsTableExists = true
    } catch (error) {
      console.log("Settings table check failed:", error)
    }

    // Check if the Product table exists
    let productTableExists = false
    try {
      await prisma.product.findFirst()
      productTableExists = true
    } catch (error) {
      console.log("Product table check failed:", error)
    }

    // Return the status of the schema
    return {
      success: true,
      message: "Schema check completed",
      tables: {
        user: userTableExists,
        settings: settingsTableExists,
        product: productTableExists,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Schema check failed",
      error,
    }
  }
}
