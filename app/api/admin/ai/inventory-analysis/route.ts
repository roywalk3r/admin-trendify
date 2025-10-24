import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/ai/gemini-service";
import { createApiResponse } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
      return createApiResponse({
        error: "AI service not configured. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY in environment variables.",
        status: 503,
      });
    }

    // Get inventory data from database
    // First, get all products and filter in memory (Prisma doesn't support comparing two columns directly)
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        name: true,
        stock: true,
        lowStockAlert: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Filter for low stock items (stock <= lowStockAlert)
    const lowStockItems = allProducts
      .filter(p => p.stock <= (p.lowStockAlert || 10))
      .slice(0, 20);

    // Get top selling products (based on order items)
    const topSellingItems = await prisma.product.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        name: true,
        category: {
          select: {
            name: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
          },
        },
      },
      take: 10,
    });

    // Calculate sales for each product
    const topSellingWithSales = topSellingItems.map(product => ({
      name: product.name,
      category: product.category.name,
      sales: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    })).sort((a, b) => b.sales - a.sales);

    const inventoryData = {
      lowStockItems: lowStockItems.map(item => ({
        name: item.name,
        stock: item.stock,
        category: item.category.name,
      })),
      topSellingItems: topSellingWithSales,
      seasonalTrends: `Current season analysis for ${new Date().toLocaleDateString()}`,
    };

    const result = await geminiService.analyzeInventory(inventoryData);

    if (!result.success) {
      return createApiResponse({
        error: result.error || "Failed to analyze inventory",
        status: 500,
      });
    }

    // Try to parse JSON response from AI
    let parsedData;
    try {
      parsedData = JSON.parse(result.data);
    } catch {
      // If not JSON, return structured fallback
      parsedData = {
        restockingRecommendations: result.data,
        categoryAnalysis: "Analysis provided in recommendations",
        seasonalOpportunities: "See full analysis",
        riskAssessment: "Medium risk for current inventory levels",
        revenueOptimization: "Focus on top-selling categories",
      };
    }

    return createApiResponse({
      data: {
        analysis: parsedData,
        rawData: inventoryData,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Inventory analysis error:", error);
    return createApiResponse({
      error: "Internal server error",
      status: 500,
    });
  }
}
