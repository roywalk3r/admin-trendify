import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { apiError } from "@/lib/api-utils"

import { DataExporter } from "@/lib/data-export"
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return apiError("Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // products, orders, users
    const format = searchParams.get("format") || "csv"

    let data: any[] = []
    let filename = ""

    switch (type) {
      case "products":
        data = await DataExporter.exportProducts()
        filename = `products-export-${new Date().toISOString().split("T")[0]}`
        break
      case "orders":
        data = await DataExporter.exportOrders()
        filename = `orders-export-${new Date().toISOString().split("T")[0]}`
        break
      case "users":
        data = await DataExporter.exportUsers()
        filename = `users-export-${new Date().toISOString().split("T")[0]}`
        break
      default:
        return apiError("Invalid export type", 400)
    }

    if (format === "csv") {
      const csv = DataExporter.convertToCSV(data, filename)

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Export error:", error)
    return apiError("Export failed")
  }
}
