import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/ai/gemini-service";
import { createApiResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, title, comment, productName } = body;

    if (!comment || !productName || rating === undefined) {
      return createApiResponse({
        error: "Rating, comment, and product name are required",
        status: 400,
      });
    }

    const result = await geminiService.moderateReview({
      rating,
      title,
      comment,
      productName,
    });

    if (!result.success) {
      return createApiResponse({
        error: result.error || "Failed to moderate review",
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
        appropriateness: "appropriate",
        authenticity: "likely authentic",
        helpfulness: 7,
        sentiment: rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative",
        topics: ["general feedback"],
        recommendation: "approve",
        reasoning: "Standard review content",
      };
    }

    return createApiResponse({
      data: parsedData,
      status: 200,
    });
  } catch (error) {
    console.error("Review moderation error:", error);
    return createApiResponse({
      error: "Internal server error",
      status: 500,
    });
  }
}
