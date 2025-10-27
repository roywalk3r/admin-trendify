"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2, Trash2, Edit, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type City = {
  id: string
  name: string
  doorFee: number
  isActive: boolean
}

export default function DeliveryCitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [newCity, setNewCity] = useState("")
  const [newDoorFee, setNewDoorFee] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDoorFee, setEditDoorFee] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const loadCities = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/delivery-cities")
      const json = await res.json()
      if (res.ok) {
        setCities(json.data?.cities || [])
      } else {
        throw new Error(json.error || "Failed to load cities")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load cities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCities()
  }, [])

  const handleAddCity = async () => {
    if (!newCity.trim() || isNaN(Number(newDoorFee))) return

    setSaving(true)
    try {
      const res = await fetch("/api/admin/delivery-cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCity.trim(),
          doorFee: Number(newDoorFee),
          isActive: true,
        }),
      })

      if (res.ok) {
        setNewCity("")
        setNewDoorFee("")
        await loadCities()
        toast({
          title: "Success",
          description: "City added successfully",
        })
      } else {
        const json = await res.json()
        throw new Error(json.error || "Failed to add city")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add city",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCity = async (id: string) => {
    if (!editName.trim() || isNaN(Number(editDoorFee))) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/delivery-cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          doorFee: Number(editDoorFee),
        }),
      })

      if (res.ok) {
        setEditingId(null)
        await loadCities()
        toast({
          title: "Success",
          description: "City updated successfully",
        })
      } else {
        const json = await res.json()
        throw new Error(json.error || "Failed to update city")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update city",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this city?")) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/delivery-cities/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await loadCities()
        toast({
          title: "Success",
          description: "City deleted successfully",
        })
      } else {
        const json = await res.json()
        throw new Error(json.error || "Failed to delete city")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete city",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleCityStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/delivery-cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to update city status")
      }
      
      await loadCities()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update city status",
        variant: "destructive",
      })
    }
  }

  const startEditing = (city: City) => {
    setEditingId(city.id)
    setEditName(city.name)
    setEditDoorFee(city.doorFee.toString())
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName("")
    setEditDoorFee("")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Cities</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New City</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="cityName">City Name</Label>
              <Input
                id="cityName"
                placeholder="Enter city name"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
              />
            </div>
            <div className="w-32 space-y-2">
              <Label htmlFor="doorFee">Door Fee</Label>
              <div className="relative">
                <span className="absolute left-2 top-2">$</span>
                <Input
                  id="doorFee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-6"
                  value={newDoorFee}
                  onChange={(e) => setNewDoorFee(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCity} disabled={!newCity.trim() || !newDoorFee || saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add City
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Cities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cities found. Add your first city above.
            </div>
          ) : (
            <div className="space-y-2">
              {cities.map((city) => (
                <div key={city.id} className="flex items-center p-4 border rounded-lg">
                  {editingId === city.id ? (
                    <>
                      <div className="flex-1 flex gap-4">
                        <div className="flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="City name"
                          />
                        </div>
                        <div className="w-32">
                          <div className="relative">
                            <span className="absolute left-2 top-2">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="pl-6"
                              value={editDoorFee}
                              onChange={(e) => setEditDoorFee(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateCity(city.id)}
                          disabled={saving || !editName.trim() || isNaN(Number(editDoorFee))}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{city.name}</span>
                          <span className="text-sm text-muted-foreground">${city.doorFee.toFixed(2)} delivery fee</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`active-${city.id}`}
                            checked={city.isActive}
                            onCheckedChange={() => toggleCityStatus(city.id, city.isActive)}
                            disabled={saving}
                          />
                          <Label htmlFor={`active-${city.id}`} className="text-sm">
                            {city.isActive ? "Active" : "Inactive"}
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(city)}
                          disabled={saving}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCity(city.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
