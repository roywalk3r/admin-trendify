"use client"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export type DeliveryMethod = "pickup" | "door"

export type DeliverySelection = {
  method: DeliveryMethod
  pickupCity?: string | null
  pickupLocation?: string | null
}

// Fallback values if API fails
export const PICKUP_OPTIONS_FALLBACK: Record<string, string[]> = {
  Accra: ["Osu Shop", "East Legon Center", "Spintex Hub"],
  Kumasi: ["Adum Branch", "Ahodwo Pickup"],
  Tamale: ["Central Pickup"],
}

export const DOOR_FEES_FALLBACK: Record<string, number> = {
  Accra: 20,
  Kumasi: 25,
  Tamale: 30,
  Default: 35,
}

type Props = {
  value: DeliverySelection
  onChange: (val: DeliverySelection) => void
  className?: string
}

export default function DeliveryOptions({ value, onChange, className }: Props) {
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [options, setOptions] = useState<{ name: string; doorFee: number; locations: { id: string; name: string; address: string | null }[] }[]>([])
  const cities = useMemo(() => {
    if (options.length) return options.map((o) => o.name)
    // Only use fallback if there was a fetch error; otherwise show none to reflect real DB state
    return fetchError ? Object.keys(PICKUP_OPTIONS_FALLBACK) : []
  }, [options, fetchError])
  const hasPickupCity = useMemo(() => !!value.pickupCity && cities.includes(String(value.pickupCity)), [value.pickupCity, cities])
  const locations = useMemo(() => {
    const cityName = String(value.pickupCity || "")
    if (!cityName) return []
    const fromApi = options.find((o) => o.name === cityName)?.locations?.map((l) => l.name) || []
    if (fromApi.length) return fromApi
    return fetchError ? (PICKUP_OPTIONS_FALLBACK[cityName] || []) : []
  }, [value.pickupCity, options, fetchError])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/shipping/options")
        if (!res.ok) throw new Error("failed")
        const data = await res.json()
        if (mounted && Array.isArray(data?.data)) {
          setOptions(data.data)
          setFetchError(false)
        }
      } catch {
        if (mounted) setFetchError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (value.method === "pickup") {
      if (!hasPickupCity) {
        // Only auto-select when we have at least one real or fallback city
        const firstCity = cities[0]
        if (firstCity) {
          const locs = (options.find((o) => o.name === firstCity)?.locations || []).map((l) => l.name)
          const fallback = fetchError ? (PICKUP_OPTIONS_FALLBACK[firstCity] || []) : []
          onChange({ method: "pickup", pickupCity: firstCity, pickupLocation: (locs[0] || fallback[0] || null) })
        }
      } else if (!value.pickupLocation && locations.length > 0) {
        onChange({ ...value, pickupLocation: locations[0] })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.method, value.pickupCity, locations.length])

  return (
    <div className={cn("space-y-3", className)}>
      <Label>Delivery method</Label>
      <RadioGroup
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        value={value.method}
        onValueChange={(v) => onChange({ ...value, method: v as DeliveryMethod })}
      >
        <label className={"flex items-start gap-3 rounded-md border p-3"}>
          <RadioGroupItem value="pickup" />
          <div>
            <div className="font-medium">Pickup at our pickup point</div>
            <div className="text-xs text-muted-foreground">Free (0 delivery fee)</div>
          </div>
        </label>
        <label className={"flex items-start gap-3 rounded-md border p-3"}>
          <RadioGroupItem value="door" />
          <div>
            <div className="font-medium">Door-to-door delivery</div>
            <div className="text-xs text-muted-foreground">Delivery fee applies by city</div>
          </div>
        </label>
      </RadioGroup>

      {value.method === "pickup" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Pickup city</Label>
            <Select
              value={value.pickupCity || undefined}
              onValueChange={(city) => {
                const locs = (options.find((o) => o.name === city)?.locations || []).map((l) => l.name)
                const fallback = fetchError ? (PICKUP_OPTIONS_FALLBACK[city] || []) : []
                onChange({ method: "pickup", pickupCity: city, pickupLocation: (locs[0] || fallback[0] || null) })
              }}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pickup location</Label>
            <Select
              value={value.pickupLocation || undefined}
              onValueChange={(loc) => onChange({ ...value, pickupLocation: loc })}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
