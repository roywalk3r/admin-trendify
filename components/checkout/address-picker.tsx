"use client"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export type Address = {
  id: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

type Props = {
  selectedId: string | null
  onChange: (id: string) => void
  className?: string
}

export default function AddressPicker({ selectedId, onChange, className }: Props) {
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Address, "id">>({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    isDefault: false,
  })

  const selected = useMemo(() => addresses.find(a => a.id === selectedId) || null, [addresses, selectedId])

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/profile/addresses")
      const json = await res.json()
      const list: Address[] = Array.isArray(json?.data) ? json.data : []
      // Prefer default at top
      list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      setAddresses(list)
      if (!selectedId && list.length > 0) {
        onChange(list[0].id)
      }
    } catch (e: any) {
      toast({ title: "Failed to load addresses", description: e?.message || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openNew = () => {
    setEditingId(null)
    setForm({ fullName: "", street: "", city: "", state: "", zipCode: "", country: "", phone: "", isDefault: addresses.length === 0 })
    setShowForm(true)
  }

  const openEdit = (addr: Address) => {
    setEditingId(addr.id)
    setForm({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    })
    setShowForm(true)
  }

  const remove = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/profile/addresses/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json())?.error || "Delete failed")
      toast({ title: "Address deleted" })
      await load()
      if (selectedId === id) {
        onChange("")
      }
    } catch (e: any) {
      toast({ title: "Failed to delete", description: e?.message || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = { ...form }
      let res: Response
      if (editingId) {
        res = await fetch(`/api/profile/addresses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/profile/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) throw new Error((await res.json())?.error || "Save failed")
      toast({ title: editingId ? "Address updated" : "Address added" })
      setShowForm(false)
      setEditingId(null)
      await load()
      // if default or first address, pick it
      const preferred = addresses.find(a => a.isDefault) || addresses[0]
      if (preferred) onChange(preferred.id)
    } catch (e: any) {
      toast({ title: "Failed to save", description: e?.message || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Shipping address</h2>
        <Button size="sm" onClick={openNew} className="bg-ascent hover:bg-ascent/90">Add new</Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading addresses...</p>}

      {!loading && addresses.length === 0 && (
        <p className="text-sm text-muted-foreground">No addresses yet. Add one to continue.</p>
      )}

      <div className="space-y-2">
        {addresses.map(addr => (
          <div key={addr.id} className={cn("rounded-md border p-3 flex items-start gap-3", selectedId === addr.id && "ring-2 ring-ascent")}>            
            <input
              type="radio"
              className="mt-1"
              name="address"
              checked={selectedId === addr.id}
              onChange={() => onChange(addr.id)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium leading-tight">{addr.fullName}</p>
                {addr.isDefault && <span className="text-[10px] rounded bg-muted px-1.5 py-0.5">Default</span>}
              </div>
              <p className="text-xs text-muted-foreground">{addr.street}, {addr.city}, {addr.state}, {addr.zipCode}, {addr.country}</p>
              <p className="text-xs text-muted-foreground">{addr.phone}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(addr)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(addr.id)}>Delete</Button>
                {!addr.isDefault && (
                  <Button size="sm" onClick={() => openEdit({ ...addr, isDefault: true })}>Set default</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-md border p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="street">Street</Label>
              <Input id="street" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input id="isDefault" type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
              <Label htmlFor="isDefault">Set as default</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-ascent hover:bg-ascent/90" disabled={loading}>{editingId ? "Save changes" : "Add address"}</Button>
            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}
