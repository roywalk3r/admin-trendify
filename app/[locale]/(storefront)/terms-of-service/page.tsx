import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Headset,
  MapPin,
  Mail,
  Package,
  Phone,
  RefreshCw,
  ScrollText,
  ShieldCheck,
} from "lucide-react"

export const metadata = {
  title: "Terms of Service | Trendify",
  description: "Read our terms and conditions for using Trendify.",
}

export default function TermsOfServicePage() {
  const lastUpdated = "January 3, 2025"

  const toId = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const highlights = [
    {
      title: "Clear & Human",
      description: "Plain-language terms that focus on how we keep your experience safe.",
      icon: ShieldCheck,
    },
    {
      title: "Fair Policies",
      description: "Transparent pricing, shipping options, and return windows you can plan around.",
      icon: ScrollText,
    },
    {
      title: "Here to Help",
      description: "Real support for orders, returns, and account questions when you need it.",
      icon: Headset,
    },
  ]

  const sections = [
    {
      title: "1. Acceptance of Terms",
      id: toId("Acceptance of Terms"),
      content: (
        <p className="text-muted-foreground">
          By accessing and using Trendify (&quot;the Service&quot;), you accept and agree to be bound by these terms.
          If you do not agree, please discontinue using the Service.
        </p>
      ),
    },
    {
      title: "2. Use of Service",
      id: toId("Use of Service"),
      content: (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Eligibility</h3>
            <p className="text-muted-foreground">
              You must be at least 18 years old to use the Service. By using it, you confirm you meet this age requirement.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Account Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Keep your login details secure and confidential.</li>
              <li>Provide accurate, complete information and keep it updated.</li>
              <li>Notify us promptly about any unauthorized access.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Prohibited Activities</h3>
            <p className="text-muted-foreground mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Violate any laws or regulations.</li>
              <li>Infringe intellectual property rights.</li>
              <li>Transmit harmful or malicious code.</li>
              <li>Attempt unauthorized access to our systems.</li>
              <li>Engage in fraud, harassment, or abuse.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "3. Products and Pricing",
      id: toId("Products and Pricing"),
      content: (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Product Information</h3>
            <p className="text-muted-foreground">
              We work to keep product descriptions, images, and details accurate. Minor variations may occur, and we do
              not guarantee error-free content.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Pricing</h3>
            <p className="text-muted-foreground">
              Prices are listed in GHS and may change without notice. We may modify or discontinue products at any time.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Availability</h3>
            <p className="text-muted-foreground">
              Availability can change quickly. We may limit quantities or decline orders at our discretion.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "4. Orders and Payment",
      id: toId("Orders and Payment"),
      content: (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Order Acceptance</h3>
            <p className="text-muted-foreground">
              Your order is an offer to purchase. We reserve the right to accept or reject any order. Confirmation alone
              does not guarantee acceptance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Payment</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Secure processing via Paystack.</li>
              <li>Charges apply at prices shown during checkout.</li>
              <li>Gateway fees appear before you place an order.</li>
              <li>Failed payments may cancel or delay your order.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "5. Shipping and Delivery",
      id: toId("Shipping and Delivery"),
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">We offer multiple delivery options:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Pickup:</strong> Free pickup from designated locations.
            </li>
            <li>
              <strong>Door-to-Door:</strong> Delivery to your address (fees vary by city).
            </li>
          </ul>
          <p className="text-muted-foreground">
            Delivery times are estimates. We are not liable for carrier delays or unforeseen disruptions.
          </p>
        </div>
      ),
    },
    {
      title: "6. Returns and Refunds",
      id: toId("Returns and Refunds"),
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Our return and refund policy:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Returns within 14 days of delivery.</li>
            <li>Items must be unused and in original condition.</li>
            <li>Proof of purchase is required.</li>
            <li>Refunds process within 7–10 business days.</li>
            <li>Return shipping costs may apply.</li>
          </ul>
          <p className="text-muted-foreground">
            See our <a href="/refund-policy" className="text-primary underline">Refund Policy</a> for full details.
          </p>
        </div>
      ),
    },
    {
      title: "7. Intellectual Property",
      id: toId("Intellectual Property"),
      content: (
        <p className="text-muted-foreground">
          All content on the Service (text, graphics, logos, images, software) is owned by Trendify or its licensors and
          protected by applicable laws. Do not reproduce or distribute without written permission.
        </p>
      ),
    },
    {
      title: "8. Limitation of Liability",
      id: toId("Limitation of Liability"),
      content: (
        <p className="text-muted-foreground">
          To the maximum extent permitted by law, Trendify is not liable for indirect, incidental, special,
          consequential, or punitive damages, nor for lost profits, data, or goodwill arising from your use of the
          Service.
        </p>
      ),
    },
    {
      title: "9. Indemnification",
      id: toId("Indemnification"),
      content: (
        <p className="text-muted-foreground">
          You agree to indemnify and hold harmless Trendify and its team from claims, damages, and expenses arising from
          your use of the Service or violation of these Terms.
        </p>
      ),
    },
    {
      title: "10. Governing Law",
      id: toId("Governing Law"),
      content: (
        <p className="text-muted-foreground">
          These Terms are governed by the laws of Ghana, without regard to conflict-of-law principles.
        </p>
      ),
    },
    {
      title: "11. Changes to Terms",
      id: toId("Changes to Terms"),
      content: (
        <p className="text-muted-foreground">
          We may update these Terms at any time. Material changes will be posted here, and continued use of the Service
          means you accept the updated Terms.
        </p>
      ),
    },
  ]

  const contactItems = [
    { icon: Mail, label: "Email", value: "support@trendify.com", href: "mailto:support@trendify.com" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: MapPin, label: "Address", value: "123 Fashion Street, NY 10001", href: "https://www.google.com/maps/search/?api=1&query=123%20Fashion%20Street%2C%20NY%2010001" },
  ]

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-background via-background to-muted/60">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="container max-w-6xl py-14">
        <div className="rounded-3xl border border-border/60 bg-card/70 px-8 py-10 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Updated {lastUpdated}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
              <p className="text-muted-foreground max-w-2xl">
                The rules that keep shopping on Trendify fair, secure, and predictable for everyone.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Package className="h-5 w-5 text-primary" />
              <span>Orders &amp; Shipping</span>
              <Separator orientation="vertical" className="h-6" />
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>Returns &amp; Refunds</span>
              <Separator orientation="vertical" className="h-6" />
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Security &amp; Privacy</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-border/70 bg-card/70 shadow-sm">
              <CardHeader className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[320px,1fr]">
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            <Card className="border-border/70 bg-card/70 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Navigation</CardTitle>
                <p className="text-sm text-muted-foreground">Jump to the section you need.</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {index + 1}
                    </span>
                    <span className="text-left">{section.title}</span>
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Headset className="h-4 w-4" />
                  Need help?
                </div>
                <CardTitle className="text-lg">Contact &amp; Support</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Questions about your account, orders, or these Terms? Reach out anytime.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-primary/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card
                key={section.id}
                id={section.id}
                className="relative scroll-mt-28 border-border/70 bg-card/80 shadow-sm"
              >
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-3xl bg-primary/20" />
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">{section.content}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
