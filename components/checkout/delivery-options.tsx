"use client"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useI18n } from "@/lib/i18n/I18nProvider"

export type DeliveryMethod = "pickup" | "door"

export type DeliverySelection = {
  method: DeliveryMethod
  pickupCity?: string | null
  pickupLocation?: string | null
}

type Props = {
  value: DeliverySelection
  onChange: (val: DeliverySelection) => void
  className?: string
}

export default function DeliveryOptions({ value, onChange, className }: Props) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<{ name: string; doorFee: number; locations: { id: string; name: string; address: string | null }[] }[]>([])
  const cities = useMemo(() => options.map((o) => o.name), [options])
  const hasPickupCity = useMemo(() => !!value.pickupCity && cities.includes(String(value.pickupCity)), [value.pickupCity, cities])
  const locations = useMemo(() => {
    const cityName = String(value.pickupCity || "")
    if (!cityName) return []
    return options.find((o) => o.name === cityName)?.locations?.map((l) => l.name) || []
  }, [value.pickupCity, options])

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
        }
      } catch {
        // keep options empty on error; no fallbacks
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    // Ensure a city is selected for both methods (needed for door fee calculation too)
    if (!hasPickupCity) {
      const firstCity = cities[0]
      if (firstCity) {
        const locs = (options.find((o) => o.name === firstCity)?.locations || []).map((l) => l.name)
        onChange({ method: value.method, pickupCity: firstCity, pickupLocation: value.method === "pickup" ? (locs[0] || null) : null })
        return
      }
    }
    // If pickup is selected and there is no pickupLocation yet, set the first location
    if (value.method === "pickup" && hasPickupCity && !value.pickupLocation) {
      onChange({ ...value, pickupLocation: locations[0] || null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.method, value.pickupCity, locations])

  return (
    <div className={cn("space-y-3", className)}>
      <Label>{t("checkout.deliveryMethod")}</Label>
      <RadioGroup
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        value={value.method}
        onValueChange={(v) => onChange({ ...value, method: v as DeliveryMethod })}
      >
        <label className={"flex items-start gap-3 rounded-md border p-3"}>
          <RadioGroupItem value="pickup" />
          <div>
            <div className="font-medium">{t("checkout.pickupAtPoint")}</div>
            <div className="text-xs text-muted-foreground">{t("checkout.pickupFreeNote")}</div>
          </div>
        </label>
        <label className={"flex items-start gap-3 rounded-md border p-3"}>
          <RadioGroupItem value="door" />
          <div>
            <div className="font-medium">{t("checkout.doorToDoor")}</div>
            <div className="text-xs text-muted-foreground">{t("checkout.doorFeeNote")}</div>
          </div>
        </label>
      </RadioGroup>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>{value.method === "pickup" ? t("checkout.pickupCity") : t("checkout.city")}</Label>
          <Select
            value={value.pickupCity || undefined}
            onValueChange={(city) => {
              const locs = (options.find((o) => o.name === city)?.locations || []).map((l) => l.name)
              onChange({ method: value.method, pickupCity: city, pickupLocation: value.method === "pickup" ? (locs[0] || null) : null })
            }}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder={t("checkout.selectCity")} /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {value.method === "pickup" && (
          <div>
            <Label>{t("checkout.pickupLocation")}</Label>
            <Select
              value={value.pickupLocation || undefined}
              onValueChange={(loc) => onChange({ ...value, pickupLocation: loc })}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder={t("checkout.selectLocation")} /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
