"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Thank you for subscribing!", {
        description: "You'll receive our newsletter at " + email,
      })
      setEmail("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <section className="bg-primary/5 py-16">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tight mb-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Stay in the Loop
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Subscribe to our newsletter for exclusive deals, new arrivals, and insider tips
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Subscribing..."
              ) : (
                <>
                  Subscribe
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.form>

          <motion.p
            className="text-xs text-muted-foreground mt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
