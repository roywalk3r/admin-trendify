"use client"
import { useCartStore } from "@/lib/store/cart-store"
import { useUser, SignInButton } from "@clerk/nextjs"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { computeDeliveryFee, type DeliverySelection } from "@/lib/shipping"
import { usePaymentFee } from "@/lib/contexts/settings-context"

type Props = {
    addressId?: string | null
    delivery?: DeliverySelection
    shippingFee?: number
    couponCode?: string
    discount?: number
}

export default function CheckoutButton({ addressId: addressIdProp, delivery, shippingFee: shippingFeeProp, couponCode, discount }: Props) {
    // Split selectors to minimize re-renders
    const items = useCartStore((s) => s.items)
    const subtotal = useCartStore((s) => s.subtotal)

    const { user, isLoaded } = useUser()
    const [loading, setLoading] = useState(false)
    const [guestEmail, setGuestEmail] = useState("")
    const { toast } = useToast()
    const paymentFee = usePaymentFee()

    // Memoize computed values
    const hasItems = useMemo(() => items.length > 0, [items.length])
    const totalAmount = useMemo(() => subtotal(), [subtotal])

    // Gateway fee is computed via settings context (percentage + fixed)

    const onCheckout = async () => {
        try {
            if (!isLoaded) return
            const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? ""
            const isGuest = !primaryEmail
            const effectiveEmail = isGuest ? guestEmail.trim() : primaryEmail
            if (!effectiveEmail) {
                toast({ title: "Email required", description: "Enter your email to checkout", variant: "destructive" })
                return
            }
            if (!hasItems) {
                toast({ title: "Your cart is empty" })
                return
            }
            if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
                toast({ title: "Invalid amount", description: "Cart total must be greater than 0", variant: "destructive" })
                return
            }
            const deliverySel = delivery || { method: "pickup" as const, pickupCity: null, pickupLocation: null }
            if (deliverySel.method === "pickup") {
                if (!deliverySel.pickupCity || !deliverySel.pickupLocation) {
                    toast({ title: "Select pickup city and location", variant: "destructive" })
                    return
                }
            }
            let addressId = addressIdProp || undefined
            if (deliverySel.method === "door") {
                if (isGuest) {
                    toast({ title: "Sign in required for door delivery", description: "Use pickup or sign in to use door delivery.", variant: "destructive" })
                    return
                }
                if (!addressId) {
                    const addrRes = await fetch("/api/profile/addresses")
                    if (!addrRes.ok) {
                        toast({ title: "Unable to load addresses", description: "Please try again.", variant: "destructive" })
                        return
                    }
                    const addrJson = await addrRes.json()
                    const addresses: any[] = Array.isArray(addrJson?.data) ? addrJson.data : []
                    if (!addresses || addresses.length === 0) {
                        toast({ title: "No address on file", description: "Add a shipping address in your profile before checkout.", variant: "destructive" })
                        return
                    }
                    const selected = addresses.find((a: any) => a.isDefault) || addresses[0]
                    addressId = selected?.id
                    if (!addressId) {
                        toast({ title: "Invalid address", description: "Please update your address and try again.", variant: "destructive" })
                        return
                    }
                }
            }
            const shippingFee = typeof shippingFeeProp === "number" ? shippingFeeProp : computeDeliveryFee(deliverySel.method, deliverySel.pickupCity)
            const baseAmount = Number(totalAmount) + Number(shippingFee) - Number(discount || 0)
            const r = Number(paymentFee.percentage) || 0
            const f = Number(paymentFee.fixedFee) || 0
            const grossTotal = r > 0 ? (baseAmount + f) / (1 - r) : baseAmount + f
            const gatewayFee = Math.max(0, grossTotal - baseAmount)
            const finalAmount = grossTotal
            setLoading(true)

            const orderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: isGuest ? undefined : (user?.id || (user as any)?.externalId || undefined),
                    email: effectiveEmail,
                    items: items.map((it) => ({ productId: it.id, quantity: it.quantity })),
                    addressId,
                    shipping: shippingFee,
                    tax: 0,
                    paymentMethod: "paystack",
                    couponCode: couponCode || undefined,
                    delivery: {
                      method: deliverySel.method,
                      pickupCity: deliverySel.pickupCity,
                      pickupLocation: deliverySel.pickupLocation,
                    },
                }),
            })
            if (!orderRes.ok) {
                let msg = String(orderRes.status)
                try { const j = await orderRes.json(); msg = j?.message || j?.error || msg } catch {}
                throw new Error(msg)
            }
            const orderJson = await orderRes.json()
            const orderId: string | undefined = orderJson?.data?.order?.id
            if (!orderId) throw new Error("Order creation failed")

            const initRes = await fetch("/api/payments/paystack/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    email: effectiveEmail,
                    callbackUrl: undefined,
                    delivery: {
                        method: deliverySel.method,
                        pickupCity: deliverySel.pickupCity || null,
                        pickupLocation: deliverySel.pickupLocation || null,
                    },
                    addressId,
                    shippingFee,
                    items: items.map((it: any) => ({ id: it.id, name: it.name, price: it.price, quantity: it.quantity })),
                }),
            })
            if (!initRes.ok) {
                let msg = String(initRes.status)
                try { const j = await initRes.json(); msg = j?.error || msg } catch {}
                throw new Error(msg)
            }
            const initJson = await initRes.json()
            const authUrl: string | undefined = initJson?.data?.authorization_url
            if (!authUrl) throw new Error("No authorization url")
            window.location.href = authUrl
        } catch (e: any) {
            toast({ title: "Checkout failed", description: e?.message || "", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="space-y-2">
            {!user && (
                <div className="space-y-1">
                    <label className="text-sm text-muted-foreground" htmlFor="guest-email">Email for receipt</label>
                    <Input
                        id="guest-email"
                        type="email"
                        placeholder="you@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                    />
                </div>
            )}
            <Button onClick={onCheckout} disabled={loading} className="w-full bg-ascent hover:bg-ascent/90">
                {loading ? "Redirecting..." : "Pay with Paystack"}
            </Button>
            {!user && (
                <div className="text-xs text-muted-foreground">Prefer to sign in? You can for faster checkout.</div>
            )}
        </div>
    )
}