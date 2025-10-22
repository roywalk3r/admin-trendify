import prisma from "@/lib/prisma"
import { logInfo, logError } from "@/lib/logger"
import { sendAbandonedCartEmail, sendStockAlertEmail } from "@/lib/email"

/**
 * Detect and track abandoned carts
 * Run this job hourly via cron
 */
export async function detectAbandonedCarts() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

  try {
    // Find carts abandoned > 1 hour with items
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: { lte: oneHourAgo },
        items: { some: {} }, // Has items
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    })

    let newAbandonedCount = 0

    for (const cart of abandonedCarts) {
      if (!cart.user?.email) continue

      // Check if already tracked
      const existing = await prisma.abandonedCart.findFirst({
        where: {
          userId: cart.userId,
          createdAt: { gte: oneHourAgo },
          recovered: false,
        },
      })

      if (!existing) {
        // Calculate cart value
        const cartValue = cart.items.reduce(
          (sum, item) => sum + Number(item.unitPrice) * item.quantity,
          0
        )

        // Create abandoned cart record
        await prisma.abandonedCart.create({
          data: {
            userId: cart.userId,
            email: cart.user.email,
            cartData: cart.items,
            cartValue,
          },
        })

        // Send first reminder email (1 hour)
        await sendAbandonedCartEmail(cart.user.email, {
          items: cart.items.map(item => ({
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0],
            productId: item.productId,
          })),
          cartValue,
        }, 1)

        newAbandonedCount++
      }
    }

    logInfo("Abandoned carts detected", { count: newAbandonedCount })

    // Send 24-hour reminders
    const for24hReminders = await prisma.abandonedCart.findMany({
      where: {
        remindersSent: 0,
        createdAt: { lte: twentyFourHoursAgo },
        recovered: false,
      },
    })

    for (const abandoned of for24hReminders) {
      // Send 24-hour reminder email
      await sendAbandonedCartEmail(abandoned.email, abandoned.cartData as any, 2)

      await prisma.abandonedCart.update({
        where: { id: abandoned.id },
        data: {
          remindersSent: 1,
          lastReminder: new Date(),
        },
      })
    }

    logInfo("24-hour reminders sent", { count: for24hReminders.length })

    // Send 48-hour final reminders
    const for48hReminders = await prisma.abandonedCart.findMany({
      where: {
        remindersSent: 1,
        lastReminder: { lte: fortyEightHoursAgo },
        recovered: false,
      },
    })

    for (const abandoned of for48hReminders) {
      // Send 48-hour final reminder email with discount
      await sendAbandonedCartEmail(abandoned.email, abandoned.cartData as any, 3)

      await prisma.abandonedCart.update({
        where: { id: abandoned.id },
        data: {
          remindersSent: 2,
          lastReminder: new Date(),
        },
      })
    }

    logInfo("48-hour reminders sent", { count: for48hReminders.length })

    return {
      newAbandoned: newAbandonedCount,
      reminders24h: for24hReminders.length,
      reminders48h: for48hReminders.length,
    }
  } catch (error) {
    logError(error, { context: "Abandoned cart recovery job" })
    throw error
  }
}

/**
 * Check stock and notify users who signed up for alerts
 * Run this job when products are restocked
 */
export async function processStockAlerts(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true, price: true, slug: true },
    })

    if (!product || product.stock === 0) {
      return { notified: 0 }
    }

    // Find all pending alerts for this product
    const alerts = await prisma.stockAlert.findMany({
      where: {
        productId,
        notified: false,
      },
    })

    let notifiedCount = 0

    for (const alert of alerts) {
      // Send stock alert email
      await sendStockAlertEmail(alert.email, {
        name: product.name,
        price: Number(product.price),
        slug: product.slug || product.id,
      })

      await prisma.stockAlert.update({
        where: { id: alert.id },
        data: {
          notified: true,
          notifiedAt: new Date(),
        },
      })

      notifiedCount++
    }

    logInfo("Stock alerts sent", { productId, count: notifiedCount })

    return { notified: notifiedCount }
  } catch (error) {
    logError(error, { context: "Stock alert processing", productId })
    throw error
  }
}
