import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/ai/gemini-service";
import { createApiResponse } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return createApiResponse({
        error: "Product ID is required",
        status: 400,
      });
    }

    // Fetch product data from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: true,
        orderItems: {
          include: {
            order: true,
          },
          take: 50, // Last 50 orders for analysis
        },
      },
    });

    if (!product) {
      return createApiResponse({
        error: "Product not found",
        status: 404,
      });
    }

    // Calculate sales data
    const totalSales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const recentOrders = product.orderItems.filter(
      item => new Date(item.order.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    const recentSales = recentOrders.length;

    // Get similar products for competitive analysis
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true,
        isDeleted: false,
      },
      select: {
        name: true,
        price: true,
        comparePrice: true,
      },
      take: 10,
    });

    const competitorPrices = similarProducts.map(p => Number(p.price));

    // Determine demand level based on recent sales
    let demandLevel: "low" | "medium" | "high" = "low";
    if (recentSales > 20) demandLevel = "high";
    else if (recentSales > 5) demandLevel = "medium";

    const pricingData = {
      productName: product.name,
      category: product.category.name,
      costPrice: Number(product.costPrice || 0),
      competitorPrices,
      demandLevel,
      seasonality: `Current season analysis for ${new Date().toLocaleDateString()}`,
    };

    const result = await geminiService.generatePricingStrategy(pricingData);

    if (!result.success) {
      return createApiResponse({
        error: result.error || "Failed to generate pricing strategy",
        status: 500,
      });
    }

    // Try to parse JSON response from AI
    let parsedData;
    try {
      parsedData = JSON.parse(result.data);
    } catch {
      // If not JSON, return structured fallback
      const currentPrice = Number(product.price);
      const avgCompetitorPrice = competitorPrices.length > 0 
        ? competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length 
        : currentPrice;

      parsedData = {
        optimalPrice: Math.round(avgCompetitorPrice * 1.05 * 100) / 100,
        profitMargin: currentPrice > 0 ? ((currentPrice - Number(product.costPrice || 0)) / currentPrice * 100).toFixed(1) + "%" : "N/A",
        competitivePosition: currentPrice > avgCompetitorPrice ? "Premium" : "Competitive",
        dynamicPricing: result.data,
        promotionalOpportunities: "Consider seasonal promotions",
      };
    }

    return createApiResponse({
      data: {
        analysis: parsedData,
        currentData: {
          currentPrice: Number(product.price),
          costPrice: Number(product.costPrice || 0),
          totalSales,
          recentSales,
          competitorCount: similarProducts.length,
          averageCompetitorPrice: competitorPrices.length > 0 
            ? Math.round(competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length * 100) / 100 
            : 0,
        },
      },
      status: 200,
    });
  } catch (error) {
    console.error("Pricing strategy error:", error);
    return createApiResponse({
      error: "Internal server error",
      status: 500,
    });
  }
}
