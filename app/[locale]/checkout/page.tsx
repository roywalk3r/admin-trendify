import CheckoutSection from "@/components/checkout/checkout-section"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"

export const dynamic = "force-dynamic"

export default function CheckoutPage() {
  // This will run on the server; do not read store here. Button reads client-side.
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Progress Header */}
      <div className="sticky top-[var(--mobile-header-height)] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b md:hidden">
        <CheckoutProgress currentStep={1} />
      </div>
      
      <div className="container mx-auto max-w-3xl py-6 sm:py-10 px-4 sm:px-0">
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
          <p className="text-sm text-muted-foreground">Select your shipping address and proceed to Paystack to complete your payment.</p>
        </div>
        
        <div className="border rounded-lg p-4 sm:p-6 space-y-4">
          <CheckoutSection />
        </div>
      </div>
    </div>
  )
}
