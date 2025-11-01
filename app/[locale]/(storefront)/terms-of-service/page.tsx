import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Terms of Service | Trendify",
  description: "Read our terms and conditions for using Trendify.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using Trendify (&quot;the Service&quot;), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, you should not use the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Use of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Eligibility</h3>
              <p className="text-muted-foreground">
                You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Provide accurate and complete information</li>
                <li>Update your information to keep it current</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Prohibited Activities</h3>
              <p className="text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Engage in fraudulent activities</li>
                <li>Harass or harm other users</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Products and Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Product Information</h3>
              <p className="text-muted-foreground">
                We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions, images, pricing, or other content is accurate, complete, or error-free.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pricing</h3>
              <p className="text-muted-foreground">
                All prices are listed in GHS (Ghana Cedis) and are subject to change without notice. We reserve the right to modify or discontinue products at any time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Availability</h3>
              <p className="text-muted-foreground">
                Product availability is subject to change. We may limit quantities or refuse orders at our sole discretion.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Orders and Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Order Acceptance</h3>
              <p className="text-muted-foreground">
                Your order is an offer to purchase products. We reserve the right to accept or reject any order for any reason. Order confirmation does not guarantee acceptance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Payment is processed securely via Paystack</li>
                <li>You agree to pay all charges at the prices in effect</li>
                <li>Payment gateway fees apply as disclosed at checkout</li>
                <li>Failed payments may result in order cancellation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Shipping and Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We offer multiple delivery options:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Pickup:</strong> Free pickup from designated locations</li>
              <li><strong>Door-to-Door:</strong> Delivery to your address (fees apply based on city)</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Delivery times are estimates and not guaranteed. We are not liable for delays caused by shipping carriers or unforeseen circumstances.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Returns and Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our return and refund policy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Returns accepted within 14 days of delivery</li>
              <li>Items must be unused and in original condition</li>
              <li>Proof of purchase required</li>
              <li>Refunds processed within 7-10 business days</li>
              <li>Return shipping costs may apply</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              See our <a href="/refund-policy" className="text-primary underline">Refund Policy</a> for complete details.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All content on this Service, including text, graphics, logos, images, and software, is the property of Trendify or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Trendify shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You agree to indemnify, defend, and hold harmless Trendify, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or related to your use of the Service or violation of these Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of Ghana, without regard to its conflict of law provisions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms, please contact us:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Email:</strong> support@trendify.com</li>
              <li><strong>Address:</strong> [Your Business Address]</li>
              <li><strong>Phone:</strong> [Your Phone Number]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
