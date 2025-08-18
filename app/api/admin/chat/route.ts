import { NextResponse } from "next/server";
import { geminiService } from "@/lib/ai/gemini-service";
import { createApiResponse } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

// Simple in-memory rate limiter and metrics cache (per server instance)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per key per window
const rateMap: Map<string, { count: number; resetAt: number }> = new Map();

type MetricsCache = {
  data: {
    overview: {
      totalProducts: number;
      activeProducts: number;
      lowStockCount: number;
      totalOrders: number;
      pendingOrders: number;
      totalCustomers: number;
      totalReviews: number;
      totalRevenue: number;
    };
  } | null;
  ts: number;
};

const METRICS_TTL_MS = 15_000; // 15 seconds
const metricsCache: MetricsCache = { data: null, ts: 0 };

export async function POST(req: Request) {
  try {
    const { prompt, clientContext } = await req.json();

    // Basic rate limiting by IP / forwarded-for
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      (req as any).ip ||
      "unknown";
    const nowMs = Date.now();
    const entry = rateMap.get(ip);
    if (!entry || nowMs > entry.resetAt) {
      rateMap.set(ip, { count: 1, resetAt: nowMs + RATE_LIMIT_WINDOW_MS });
    } else {
      entry.count += 1;
      if (entry.count > RATE_LIMIT_MAX) {
        return createApiResponse({
          error: "Rate limit exceeded. Please try again in a minute.",
          status: 429,
        });
      }
    }

    // Fetch live system metrics to ground AI responses
    const now = new Date();
    const nowIso = now.toISOString();
    const friendlyTimestamp = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(now) + " UTC";

    let overview: MetricsCache["data"] | null = null;
    if (metricsCache.data && nowMs - metricsCache.ts < METRICS_TTL_MS) {
      overview = metricsCache.data;
    } else {
      const [
        totalProducts,
        activeProducts,
        lowStockCountRow,
        totalOrders,
        pendingOrders,
        totalCustomers,
        totalReviews,
        revenueAgg,
      ] = await Promise.all([
        prisma.product.count({ where: { isDeleted: false } }),
        prisma.product.count({ where: { isActive: true, isDeleted: false } }),
        prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(*)::int AS count
          FROM products
          WHERE is_active = true
            AND is_deleted = false
            AND stock <= low_stock_alert
        `,
        prisma.order.count(),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.user.count({ where: { role: "customer" } }),
        prisma.review.count(),
        prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "canceled" } } }),
      ]);

      overview = {
        overview: {
          totalProducts,
          activeProducts,
          lowStockCount: Array.isArray(lowStockCountRow) && lowStockCountRow[0]?.count ? lowStockCountRow[0].count : 0,
          totalOrders,
          pendingOrders,
          totalCustomers,
          totalReviews,
          totalRevenue: Number(revenueAgg._sum.totalAmount || 0),
        },
      };
      metricsCache.data = overview;
      metricsCache.ts = nowMs;
    }

    const liveMetrics = {
      timestamp: nowIso,
      friendlyTimestamp,
      overview: overview!.overview,
      clientContext: clientContext || null,
    };

    // Add admin context plus live metrics to the prompt
    const adminContext = `You are an AI assistant for Trendify Admin Panel, an e-commerce management system.
You help with:
- Product management and optimization
- Inventory analysis and recommendations
- Order processing and customer service
- SEO and marketing content
- Analytics and business insights
- General admin tasks

You have access to the following LIVE metrics (JSON) captured at ${liveMetrics.friendlyTimestamp}:
${JSON.stringify(liveMetrics.overview, null, 2)}

Client context (from UI): ${clientContext?.pathname ? `pathname=${clientContext.pathname}` : "not provided"}

Instructions:
- If the question asks for counts or basic stats (e.g., "how many products", "pending orders"), answer directly using the provided live metrics.
- Be concise and include the friendly timestamp "${liveMetrics.friendlyTimestamp}" when referencing live data (avoid raw ISO timestamps).
- If the question is broader, use these metrics as grounding context and provide actionable advice.

User question: ${prompt}`;

    const result = await geminiService.generateText(adminContext);

    if (!result.success) {
      return createApiResponse({
        error: result.error || "Failed to generate AI response",
        status: 500,
      });
    }

    return createApiResponse({
      data: {
        response: result.data,
        model: result.model,
        metrics: liveMetrics,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Gemini error:", error);
    return createApiResponse({
      error: "Failed to generate AI response",
      status: 500,
    });
  }
}
