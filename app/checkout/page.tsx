import CheckoutSection from "@/components/checkout/checkout-section"

export default function CheckoutPage() {
  // This will run on the server; do not read store here. Button reads client-side.
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      <div className="border rounded-lg p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Select your shipping address and proceed to Paystack to complete your payment.</p>
        <CheckoutSection />
      </div>
    </div>
  )
}
