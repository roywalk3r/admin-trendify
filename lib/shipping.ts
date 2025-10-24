export type DeliveryMethod = "pickup" | "door"
export type DeliverySelection = {
  method: DeliveryMethod
  pickupCity?: string | null
  pickupLocation?: string | null
}

export function computeDeliveryFee(method: DeliveryMethod, city?: string | null): number {
  // Pickup is free
  if (method === "pickup") return 0
  // Door fees are now dynamic and fetched from /api/shipping/fee based on DeliveryCity.doorFee
  // This function intentionally returns 0 for door to avoid using any fixed fallback.
  return 0
}

export function isValidPickup(city?: string | null, location?: string | null): boolean {
  // Client should validate against /api/shipping/options data; default to basic non-empty check here.
  return Boolean(city) && Boolean(location)
}
