import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/ai/gemini-service";
import { createApiResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, features, price, targetAudience } = body;

    if (!name || !category) {
      return createApiResponse({
        error: "Product name and category are required",
        status: 400,
      });
    }

    const result = await geminiService.generateProductDescription({
      name,
      category,
      features,
      price,
      targetAudience,
    });

    if (!result.success) {
      return createApiResponse({
        error: result.error || "Failed to generate product description",
        status: 500,
      });
    }

    // Try to parse JSON response from AI
    let parsedData;
    try {
      parsedData = JSON.parse(result.data);
    } catch {
      // If not JSON, return as plain text
      parsedData = {
        description: result.data,
        shortDescription: result.data.split('\n')[0],
        bulletPoints: [],
        seoTitle: name,
        metaDescription: result.data.substring(0, 160),
      };
    }

    return createApiResponse({
      data: parsedData,
      status: 200,
    });
  } catch (error) {
    console.error("Product description generation error:", error);
    return createApiResponse({
      error: "Internal server error",
      status: 500,
    });
  }
}
