export type DeliveryMethod = "pickup" | "door"
export type DeliverySelection = {
  method: DeliveryMethod
  pickupCity?: string | null
  pickupLocation?: string | null
}

export const PICKUP_OPTIONS: Record<string, string[]> = {
  Accra: ["Osu Shop", "East Legon Center", "Spintex Hub"],
  Kumasi: ["Adum Branch", "Ahodwo Pickup"],
  Tamale: ["Central Pickup"],
}

export const DOOR_FEES: Record<string, number> = {
  Accra: 20,
  Kumasi: 25,
  Tamale: 30,
  Default: 35,
}

export function computeDeliveryFee(method: DeliveryMethod, city?: string | null): number {
  if (method === "pickup") return 0
  const key = city && DOOR_FEES[city] != null ? city : "Default"
  return DOOR_FEES[key]
}

export function isValidPickup(city?: string | null, location?: string | null): boolean {
  if (!city || !location) return false
  const locs = PICKUP_OPTIONS[city]
  return Array.isArray(locs) && locs.includes(location)
}
