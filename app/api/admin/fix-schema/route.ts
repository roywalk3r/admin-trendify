import { type NextRequest, NextResponse } from "next/server"
import { checkAndFixPrismaSchema } from "@/lib/prisma-fix"

export async function POST(req: NextRequest) {
  try {
    const result = await checkAndFixPrismaSchema()

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    console.error("Error in fix-schema route:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
