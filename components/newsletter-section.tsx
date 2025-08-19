"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Mail, CheckCircle } from "lucide-react"

export default function NewsletterSection() {
    const [email, setEmail] = useState("")
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            setIsSubscribed(true)
            setTimeout(() => {
                setIsSubscribed(false)
                setEmail("")
            }, 3000)
        }
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    }

    return (
        <motion.section
            className="relative w-full bg-gradient-to-br from-ascent/10 via-background to-ascent/5 py-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-4xl mx-auto px-8 text-center">
                <motion.div variants={itemVariants}>
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-ascent/20 rounded-full mb-6"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Mail className="w-8 h-8 text-ascent" />
                    </motion.div>
                </motion.div>

                <motion.h2 className="typography text-3xl md:text-4xl lg:text-5xl mb-4" variants={itemVariants}>
                    Stay In The Loop
                </motion.h2>

                <motion.p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto" variants={itemVariants}>
                    Be the first to know about new arrivals, exclusive deals, and fashion tips. Join our community of style
                    enthusiasts and never miss a trend.
                </motion.p>

                <motion.form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                    variants={itemVariants}
                >
                    <motion.div className="flex-1" whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 px-4 rounded-full border-2 border-ascent/20 focus:border-ascent bg-white"
                            required
                        />
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            type="submit"
                            className="h-12 px-8 bg-ascent hover:bg-ascent/90 text-white rounded-full font-semibold"
                            disabled={isSubscribed}
                        >
                            {isSubscribed ? (
                                <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Subscribed!
                                </motion.div>
                            ) : (
                                "Subscribe"
                            )}
                        </Button>
                    </motion.div>
                </motion.form>

                <motion.p className="text-sm text-muted-foreground mt-4" variants={itemVariants}>
                    No spam, unsubscribe at any time. We respect your privacy.
                </motion.p>
            </div>
        </motion.section>
    )
}
