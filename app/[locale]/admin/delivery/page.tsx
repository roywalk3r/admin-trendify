"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Save, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type Location = { id: string; name: string; address: string | null; isActive: boolean }
type City = { id: string; name: string; doorFee: number; isActive: boolean; locations: Location[] }

export default function AdminDeliveryPage() {
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [newCity, setNewCity] = useState({ name: "", doorFee: "" })

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/delivery/cities")
      const data = await res.json()
      if (res.ok) setCities(data.data || [])
      else throw new Error(data?.error || "Failed to load cities")
    } catch (e: any) {
      toast.error(e.message || "Failed to load delivery data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addCity = async () => {
    const name = newCity.name.trim()
    const doorFee = Number(newCity.doorFee)
    if (!name || !Number.isFinite(doorFee)) {
      toast.error("Enter a valid city name and fee")
      return
    }
    try {
      const res = await fetch("/api/admin/delivery/cities", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, doorFee }) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to create city")
      toast.success("City created")
      setNewCity({ name: "", doorFee: "" })
      await load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const updateCity = async (id: string, patch: Partial<City>) => {
    try {
      const res = await fetch(`/api/admin/delivery/cities/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to update city")
      toast.success("City updated")
      await load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const deleteCity = async (id: string) => {
    if (!confirm("Delete city and all its locations?")) return
    try {
      const res = await fetch(`/api/admin/delivery/cities/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to delete city")
      toast.success("City deleted")
      await load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const addLocation = async (cityId: string, name: string, address?: string) => {
    const n = name.trim()
    if (!n) return toast.error("Location name required")
    try {
      const res = await fetch(`/api/admin/delivery/locations`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId, name: n, address }) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to add location")
      toast.success("Location added")
      await load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const updateLocation = async (id: string, patch: Partial<Location>) => {
    try {
      const res = await fetch(`/api/admin/delivery/locations/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to update location")
      toast.success("Location updated")
      await load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const deleteLocation = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/delivery/locations/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to delete location")
      toast.success("Location deleted")
      await load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Delivery Management</h1>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add City</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>City Name</Label>
              <Input value={newCity.name} onChange={(e) => setNewCity((s) => ({ ...s, name: e.target.value }))} placeholder="Accra" />
            </div>
            <div className="space-y-2">
              <Label>Door Delivery Fee</Label>
              <Input type="number" value={newCity.doorFee} onChange={(e) => setNewCity((s) => ({ ...s, doorFee: e.target.value }))} placeholder="20" />
            </div>
            <div className="flex items-end">
              <Button onClick={addCity}>
                <Plus className="mr-2 h-4 w-4" /> Add City
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {cities.map((city) => (
          <Card key={city.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{city.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="mr-2">Active</Label>
                    <Switch checked={city.isActive} onCheckedChange={(v) => updateCity(city.id, { isActive: v })} />
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => deleteCity(city.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City Name</Label>
                  <div className="flex gap-2">
                    <Input defaultValue={city.name} onBlur={(e) => e.target.value.trim() !== city.name && updateCity(city.id, { name: e.target.value.trim() })} />
                    <Button variant="outline" onClick={() => updateCity(city.id, { name: (document.activeElement as HTMLInputElement)?.value || city.name })}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Door Fee</Label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue={city.doorFee} onBlur={(e) => updateCity(city.id, { doorFee: Number(e.target.value) })} />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <Label>Pickup Locations</Label>
              <div className="mt-2 space-y-2">
                {city.locations.map((loc) => (
                  <div key={loc.id} className="grid md:grid-cols-3 gap-2 items-center">
                    <Input defaultValue={loc.name} onBlur={(e) => e.target.value.trim() !== loc.name && updateLocation(loc.id, { name: e.target.value.trim() })} />
                    <Input placeholder="Address (optional)" defaultValue={loc.address || ""} onBlur={(e) => updateLocation(loc.id, { address: e.target.value })} />
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="mr-2">Active</Label>
                        <Switch checked={loc.isActive} onCheckedChange={(v) => updateLocation(loc.id, { isActive: v })} />
                      </div>
                      <Button variant="destructive" size="icon" onClick={() => deleteLocation(loc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <AddLocationRow onAdd={(name, address) => addLocation(city.id, name, address)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AddLocationRow({ onAdd }: { onAdd: (name: string, address?: string) => void }) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  return (
    <div className="grid md:grid-cols-3 gap-2 items-center mt-3">
      <Input placeholder="New location name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="flex justify-end">
        <Button onClick={() => { onAdd(name, address); setName(""); setAddress("") }}>
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>
    </div>
  )
}
