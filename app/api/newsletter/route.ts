import { NextRequest } from "next/server"
import { z } from "zod"
import { createApiResponse, handleApiError, checkRateLimit } from "@/lib/api-utils"
import { sendNewsletterWelcomeEmail } from "@/lib/email/newsletter"
import { logInfo } from "@/lib/logger"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting for newsletter subscriptions
    const clientIp = req.headers.get("x-forwarded-for") || "unknown"
    const isRateLimited = await checkRateLimit(`${clientIp}:newsletter`, 5, 300) // 5 per 5 minutes
    
    if (isRateLimited) {
      return createApiResponse({
        error: "Too many subscription attempts. Please try again later.",
        status: 429,
      })
    }

    const body = await req.json()
    const { email, name } = newsletterSchema.parse(body)

    // Check if email already exists in newsletter
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email }
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return createApiResponse({
          message: "You're already subscribed to our newsletter!",
          status: 200,
        })
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { 
            isActive: true,
            name: name || existingSubscription.name,
            subscribedAt: new Date()
          }
        })
      }
    } else {
      // Create new subscription
      await prisma.newsletterSubscription.create({
        data: {
          email,
          name,
          isActive: true,
          subscribedAt: new Date()
        }
      })
    }

    // Send welcome email
    try {
      await sendNewsletterWelcomeEmail(email, name || "Valued Customer")
    } catch (emailError) {
      logInfo("Newsletter welcome email failed to send", { email, error: emailError })
      // Don't fail the subscription if email fails
    }

    logInfo("Newsletter subscription successful", { email, name })

    return createApiResponse({
      message: "Successfully subscribed to newsletter!",
      status: 201,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (!email) {
      return createApiResponse({
        error: "Email is required",
        status: 400,
      })
    }

    // Simple unsubscribe (in production, you'd want a proper token system)
    await prisma.newsletterSubscription.updateMany({
      where: { email },
      data: { 
        isActive: false,
        unsubscribedAt: new Date()
      }
    })

    logInfo("Newsletter unsubscription", { email })

    return createApiResponse({
      message: "Successfully unsubscribed from newsletter",
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
