import { NextRequest, NextResponse } from "next/server"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { logInfo, logWarn } from "@/lib/logger"
import prisma from "@/lib/prisma"

interface WebVitalsData {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  delta: number
  navigationType: string
  url: string
  userAgent: string
  timestamp: number
  connection?: {
    effectiveType: string
    rtt: number
    downlink: number
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: WebVitalsData = await req.json()
    
    // Validate required fields
    if (!data.metric || !data.value || !data.url) {
      return createApiResponse({
        error: "Missing required fields: metric, value, url",
        status: 400,
      })
    }

    // Log the metric for immediate visibility
    logInfo("Web Vitals metric received", {
      metric: data.metric,
      value: data.value,
      rating: data.rating,
      url: data.url,
      userAgent: data.userAgent?.substring(0, 100), // Truncate for logging
    })

    // Store in database for analysis
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'PAGE_VIEW', // We'll use this enum value for web vitals
          metadata: {
            type: 'web-vitals',
            metric: data.metric,
            value: data.value,
            rating: data.rating,
            id: data.id,
            delta: data.delta,
            navigationType: data.navigationType,
            url: data.url,
            userAgent: data.userAgent,
            connection: data.connection,
            timestamp: data.timestamp,
          }
        }
      })
    } catch (dbError) {
      // Don't fail the request if database write fails
      logWarn("Failed to store web vitals in database", { error: dbError })
    }

    // Alert on poor performance metrics
    if (data.rating === 'poor') {
      logWarn("Poor Web Vitals metric detected", {
        metric: data.metric,
        value: data.value,
        url: data.url,
        userAgent: data.userAgent?.substring(0, 100),
      })

      // You could add alerting logic here (email, Slack, etc.)
      // await sendPerformanceAlert(data)
    }

    // Track aggregated metrics for dashboard
    await trackAggregatedMetrics(data)

    return createApiResponse({
      data: { success: true },
      status: 200,
    })
  } catch (error) {
    // Don't log full error details for analytics endpoint to avoid noise
    logWarn("Web vitals endpoint error", { 
      error: error instanceof Error ? error.message : String(error) 
    })
    
    return createApiResponse({
      data: { success: false },
      status: 200, // Return 200 to avoid retries
    })
  }
}

async function trackAggregatedMetrics(data: WebVitalsData) {
  try {
    // Create or update daily aggregations
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const key = `web-vitals:${data.metric}:${today}`
    
    // For now, we'll store in the settings table as JSON
    // In production, you might want a dedicated metrics table
    const existing = await prisma.settings.findUnique({
      where: { key }
    })

    if (existing) {
      const currentData = existing.value as any
      const updatedData = {
        ...currentData,
        count: currentData.count + 1,
        totalValue: currentData.totalValue + data.value,
        averageValue: (currentData.totalValue + data.value) / (currentData.count + 1),
        ratings: {
          ...currentData.ratings,
          [data.rating]: (currentData.ratings[data.rating] || 0) + 1
        }
      }

      await prisma.settings.update({
        where: { key },
        data: { value: updatedData }
      })
    } else {
      await prisma.settings.create({
        data: {
          key,
          value: {
            metric: data.metric,
            date: today,
            count: 1,
            totalValue: data.value,
            averageValue: data.value,
            ratings: {
              [data.rating]: 1
            }
          },
          description: `Web Vitals aggregation for ${data.metric} on ${today}`
        }
      })
    }
  } catch (error) {
    logWarn("Failed to update aggregated metrics", { error })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '7')
    const metric = url.searchParams.get('metric')

    // Get aggregated data for the last N days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const dateRange: string[] = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(d.toISOString().split('T')[0])
    }

    // This is a simplified query - in production you'd want better aggregation
    const results = await prisma.settings.findMany({
      where: {
        key: {
          startsWith: 'web-vitals:'
        }
      }
    })

    const aggregatedData = results
      .filter(item => {
        const data = item.value as any
        const date = data?.date
        return date && dateRange.includes(date) && (!metric || item.key.includes(metric))
      })
      .map(item => item.value as any)

    return createApiResponse({
      data: {
        aggregatedData,
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
        totalRecords: aggregatedData.length
      },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
