"use client"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import Image from "next/image"
import { Star, Quote } from "lucide-react"

interface Testimonial {
    id: string
    name: string
    role: string
    avatar: string
    rating: number
    content: string
}

export default function TestimonialsSection() {
    const testimonials: Testimonial[] = [
        {
            id: "1",
            name: "Sarah Johnson",
            role: "Fashion Blogger",
            avatar: "/images/avatar.png",
            rating: 5,
            content:
                "Trendify has completely transformed my wardrobe! The quality is exceptional and the styles are always on-point. I get compliments every time I wear their pieces.",
        },
        {
            id: "2",
            name: "Michael Chen",
            role: "Creative Director",
            avatar: "/images/avatar.png",
            rating: 5,
            content:
                "As someone who values both style and comfort, Trendify delivers on both fronts. Their customer service is outstanding and shipping is incredibly fast.",
        },
        {
            id: "3",
            name: "Emma Rodriguez",
            role: "Lifestyle Influencer",
            avatar: "/images/avatar.png",
            rating: 5,
            content:
                "I've been shopping with Trendify for over a year now, and they never disappoint. The variety is amazing and the prices are very reasonable for the quality you get.",
        },
    ]

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

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    }

    const headerVariants: Variants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    }

    return (
        <motion.section
            className="relative w-full max-w-7xl mx-auto p-8 py-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {/* Section Header */}
            <motion.div className="text-center mb-16" variants={headerVariants}>
                <motion.span
                    className="font-light text-2xl text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    what our customers say
                </motion.span>
                <motion.h2
                    className="typography text-4xl md:text-5xl capitalize mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Testimonials
                </motion.h2>
            </motion.div>

            {/* Testimonials Grid */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants}>
                {testimonials.map((testimonial, index) => (
                    <motion.div
                        key={testimonial.id}
                        className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 relative"
                        variants={cardVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Quote Icon */}
                        <motion.div
                            className="absolute -top-3 -left-3 w-8 h-8 bg-ascent rounded-full flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                        >
                            <Quote className="w-4 h-4 text-white" />
                        </motion.div>

                        {/* Rating */}
                        <motion.div
                            className="flex items-center gap-1 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.1 + 0.4 + i * 0.1 }}
                                >
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Content */}
                        <motion.p
                            className="text-foreground mb-6 leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.6 }}
                        >
                            "{testimonial.content}"
                        </motion.p>

                        {/* Author */}
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.8 }}
                        >
                            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                                <Image
                                    src={testimonial.avatar || "/placeholder.svg"}
                                    alt={testimonial.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                />
                            </motion.div>
                            <div>
                                <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.section>
    )
}
