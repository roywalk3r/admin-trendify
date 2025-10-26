/**
 * Stock Monitoring System
 * Automatically sends notifications when stock changes
 */

import prisma from '@/lib/prisma'
import { processStockAlerts } from '@/lib/jobs/abandoned-cart-recovery'
import { logInfo } from '@/lib/logger'

/**
 * Check if product needs stock alerts after update
 * Call this after updating product stock
 */
export async function checkAndNotifyStockAlerts(productId: string, oldStock: number, newStock: number) {
  try {
    // If stock went from 0 to > 0, notify subscribers
    if (oldStock === 0 && newStock > 0) {
      logInfo('Product back in stock, triggering alerts', { productId, newStock })
      await processStockAlerts(productId)
    }
    
    // If stock is low, notify admins (optional feature)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { lowStockAlert: true, name: true }
    })
    
    if (product && newStock > 0 && newStock <= product.lowStockAlert) {
      logInfo('Low stock alert', {
        productId,
        productName: product.name,
        currentStock: newStock,
        threshold: product.lowStockAlert
      })
      // TODO: Send admin notification email
    }
  } catch (error) {
    // Don't throw - this shouldn't break the main operation
    console.error('Stock alert check failed:', error)
  }
}

/**
 * Helper to get product stock before update
 */
export async function getProductStockBefore(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true }
  })
  return product?.stock || 0
}
