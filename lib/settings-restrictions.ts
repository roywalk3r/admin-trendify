"use client"

import { useGeneralSettings } from "@/contexts/settings-context"

export function useOrderRestrictions() {
  const settings = useGeneralSettings()

  return {
    allowBackorders: settings.allowBackorders,
    showOutOfStockProducts: settings.showOutOfStockProducts,
    lowStockThreshold: settings.lowStockThreshold,
    freeShippingThreshold: settings.freeShippingThreshold,
    enableFreeShipping: settings.enableFreeShipping,
    shippingFee: settings.shippingFee,
    taxRate: settings.taxRate,
    enableTaxCalculation: settings.enableTaxCalculation,
  }
}

export function useStoreInfo() {
  const settings = useGeneralSettings()

  return {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    currencyCode: settings.currencyCode,
    orderPrefix: settings.orderPrefix,
  }
}

export function calculateOrderTotal(subtotal: number, settings: ReturnType<typeof useOrderRestrictions>) {
  let total = subtotal

  // Add tax if enabled
  if (settings.enableTaxCalculation) {
    total += (subtotal * settings.taxRate) / 100
  }

  // Add shipping if not free
  if (settings.enableFreeShipping && subtotal >= settings.freeShippingThreshold) {
    // Free shipping
  } else {
    total += settings.shippingFee
  }

  return total
}

export function isProductAvailable(stock: number, allowBackorder: boolean, showOutOfStock: boolean) {
  if (stock > 0) return true
  if (stock === 0 && allowBackorder) return true
  if (stock === 0 && showOutOfStock) return true
  return false
}

export function isLowStock(stock: number, threshold: number) {
  return stock <= threshold && stock > 0
}
