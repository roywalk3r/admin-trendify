import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Settings } from "@/types"

interface FooterProps {
  settings?: Settings
}

export default function Footer({ settings }: FooterProps) {
  const siteName = settings?.general?.siteName || "ACME Store"
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/40">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6" />
              <span className="font-bold">{siteName}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop shop for premium products. Quality, style, and convenience all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div>
              <h3 className="text-lg font-medium">Shop</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                  Categories
                </Link>
                <Link href="/cart" className="text-muted-foreground hover:text-foreground">
                  Cart
                </Link>
                <Link href="/checkout" className="text-muted-foreground hover:text-foreground">
                  Checkout
                </Link>
              </nav>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div>
              <h3 className="text-lg font-medium">Company</h3>
              <nav className="mt-4 flex flex-col space-y-2 text-sm">
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium">Stay Updated</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest products, deals, and more.
            </p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button type="submit">Subscribe</Button>
            </form>
            <div className="mt-4 flex space-x-4">
              {settings?.social?.facebook && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                </Button>
              )}
              {settings?.social?.twitter && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                </Button>
              )}
              {settings?.social?.instagram && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
