import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

const bulkActionSchema = z.object({
    action: z.enum(["delete", "activate", "deactivate", "feature", "unfeature"]),
    productIds: z.array(z.string()).min(1, "At least one product ID is required"),
})

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { action, productIds } = bulkActionSchema.parse(body)

        console.log(`Performing bulk ${action} on products:`, productIds)

        let result
        switch (action) {
            case "delete":
                // Check if any products have orders
                const productsWithOrders = await prisma.orderItem.findMany({
                    where: { productId: { in: productIds } },
                    select: { productId: true },
                    distinct: ["productId"],
                })

                if (productsWithOrders.length > 0) {
                    return NextResponse.json({ error: "Cannot delete products that have been ordered" }, { status: 400 })
                }

                result = await prisma.product.deleteMany({
                    where: { id: { in: productIds } },
                })
                break

            case "activate":
                result = await prisma.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { isActive: true },
                })
                break

            case "deactivate":
                result = await prisma.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { isActive: false },
                })
                break

            case "feature":
                result = await prisma.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { isFeatured: true },
                })
                break

            case "unfeature":
                result = await prisma.product.updateMany({
                    where: { id: { in: productIds } },
                    data: { isFeatured: false },
                })
                break

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        console.log(`Bulk ${action} result:`, result)

        return NextResponse.json({
            message: `Successfully ${action}d ${result.count} products`,
            count: result.count,
        })
    } catch (error) {
        console.error(`Error performing bulk action:`, error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
    }
}
