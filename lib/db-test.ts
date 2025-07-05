import prisma from "@/lib/prisma"

/**
 * Test the database connection
 * @returns Promise<boolean> - True if connection is successful, false otherwise
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Try a simple query to check if the database is accessible
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
