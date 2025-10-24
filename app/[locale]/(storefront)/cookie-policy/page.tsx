import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Cookie Policy | Trendify",
  description: "Learn about how we use cookies on Trendify.",
}

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing site usage, and enabling certain features.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-green-600">●</span> Essential Cookies
              </h3>
              <p className="text-muted-foreground mb-2">
                These cookies are necessary for the website to function properly. They cannot be disabled.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                <li><strong>Session Management:</strong> Keeps you logged in during your session</li>
                <li><strong>Security:</strong> CSRF protection and security tokens</li>
                <li><strong>Cart Persistence:</strong> Remembers items in your shopping cart</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-blue-600">●</span> Functional Cookies
              </h3>
              <p className="text-muted-foreground mb-2">
                These cookies enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                <li><strong>Preferences:</strong> Language, currency, theme settings</li>
                <li><strong>Recently Viewed:</strong> Tracks products you've viewed</li>
                <li><strong>Wishlist:</strong> Saves your favorite items</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-purple-600">●</span> Analytics Cookies
              </h3>
              <p className="text-muted-foreground mb-2">
                These cookies help us understand how visitors interact with our website.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                <li><strong>Google Analytics:</strong> Page views, bounce rate, traffic sources</li>
                <li><strong>Performance Monitoring:</strong> Page load times, errors</li>
                <li><strong>User Behavior:</strong> Click patterns, navigation flow</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-orange-600">●</span> Marketing Cookies
              </h3>
              <p className="text-muted-foreground mb-2">
                These cookies track your browsing habits to deliver relevant advertisements.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                <li><strong>Social Media:</strong> Facebook Pixel, Twitter tracking</li>
                <li><strong>Remarketing:</strong> Google Ads, display advertising</li>
                <li><strong>Affiliate Tracking:</strong> Commission tracking for partners</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specific Cookies Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Cookie Name</th>
                    <th className="text-left py-2 px-4">Purpose</th>
                    <th className="text-left py-2 px-4">Duration</th>
                    <th className="text-left py-2 px-4">Type</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">__session</td>
                    <td className="py-2 px-4">User authentication</td>
                    <td className="py-2 px-4">Session</td>
                    <td className="py-2 px-4">Essential</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">cart_id</td>
                    <td className="py-2 px-4">Shopping cart persistence</td>
                    <td className="py-2 px-4">7 days</td>
                    <td className="py-2 px-4">Essential</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">cookie_consent</td>
                    <td className="py-2 px-4">Cookie preferences</td>
                    <td className="py-2 px-4">1 year</td>
                    <td className="py-2 px-4">Essential</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">theme</td>
                    <td className="py-2 px-4">Dark/light mode preference</td>
                    <td className="py-2 px-4">1 year</td>
                    <td className="py-2 px-4">Functional</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">_ga</td>
                    <td className="py-2 px-4">Google Analytics</td>
                    <td className="py-2 px-4">2 years</td>
                    <td className="py-2 px-4">Analytics</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono">_fbp</td>
                    <td className="py-2 px-4">Facebook Pixel</td>
                    <td className="py-2 px-4">3 months</td>
                    <td className="py-2 px-4">Marketing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Cookie Banner</h3>
              <p className="text-muted-foreground">
                When you first visit our website, you'll see a cookie consent banner. You can choose to accept all cookies or customize your preferences.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Browser Settings</h3>
              <p className="text-muted-foreground mb-2">
                You can also manage cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Note:</strong> Disabling essential cookies may affect website functionality, including the ability to add items to cart or complete purchases.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We use the following third-party services that may set cookies:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <strong>Clerk:</strong> Authentication and user management<br/>
                <span className="text-sm">Privacy Policy: <a href="https://clerk.com/privacy" className="text-primary underline">clerk.com/privacy</a></span>
              </li>
              <li>
                <strong>Paystack:</strong> Payment processing<br/>
                <span className="text-sm">Privacy Policy: <a href="https://paystack.com/privacy" className="text-primary underline">paystack.com/privacy</a></span>
              </li>
              <li>
                <strong>Google Analytics:</strong> Website analytics<br/>
                <span className="text-sm">Privacy Policy: <a href="https://policies.google.com/privacy" className="text-primary underline">policies.google.com/privacy</a></span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. Please revisit this page periodically to stay informed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Email:</strong> privacy@trendify.com</li>
              <li><strong>Address:</strong> [Your Business Address]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
