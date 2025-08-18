import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/ai/gemini-service";
import { createApiResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, category, description, targetKeywords } = body;

    if (!productName || !category || !description) {
      return createApiResponse({
        error: "Product name, category, and description are required",
        status: 400,
      });
    }

    const result = await geminiService.generateSEOContent({
      productName,
      category,
      description,
      targetKeywords,
    });

    if (!result.success) {
      return createApiResponse({
        error: result.error || "Failed to generate SEO content",
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
        seoTitle: productName,
        metaDescription: description.substring(0, 160),
        h1Heading: productName,
        keywords: [category, productName],
        altText: `${productName} - ${category}`,
        urlSlug: productName.toLowerCase().replace(/\s+/g, '-'),
      };
    }

    return createApiResponse({
      data: parsedData,
      status: 200,
    });
  } catch (error) {
    console.error("SEO optimization error:", error);
    return createApiResponse({
      error: "Internal server error",
      status: 500,
    });
  }
}
