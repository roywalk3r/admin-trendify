"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { motion } from "framer-motion"

export default function NewsLetter() {
  return (
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Stay Updated</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Subscribe to our newsletter for exclusive deals, new arrivals, and more.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button>Subscribe</Button>
              </div>
            </motion.div>
            <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                  <h3 className="font-medium">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground text-center">On orders over $50</p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
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
                      className="h-8 w-8 text-primary"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <h3 className="font-medium">Satisfaction</h3>
                  <p className="text-sm text-muted-foreground text-center">100% guarantee</p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
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
                      className="h-8 w-8 text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  <h3 className="font-medium">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground text-center">Protected checkout</p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
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
                      className="h-8 w-8 text-primary"
                  >
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m8 17 4 4 4-4" />
                  </svg>
                  <h3 className="font-medium">Easy Returns</h3>
                  <p className="text-sm text-muted-foreground text-center">30 day policy</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  )
}
