"use client"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import ProductCard from "./product-card"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"
import { useApi } from "@/lib/hooks/use-api"
import Link from "next/link";

export default function FeaturedProducts() {
    const { data, isLoading, error } = useApi<{
        products: Array<{
            id: string
            name: string
            price: number
            images: string[]
            averageRating?: number
            reviewCount?: number
          }>
        pagination: any
      }>("/api/products?limit=8")

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const headerVariants: Variants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    }

    return (
        <motion.section
            className="relative w-full max-w-7xl mx-auto p-8 py-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            {isLoading && (
                <div className="text-center py-10 text-muted-foreground">Loading featured products...</div>
            )}
            {error && (
                <div className="text-center py-10 text-red-500">Failed to load products: {error}</div>
            )}
            {/* Section Header */}
            <motion.div className="text-center mb-12" variants={headerVariants}>
                <motion.span
                    className="font-light text-2xl text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    discover our
                </motion.span>
                <motion.h2
                    className="typography text-4xl md:text-5xl capitalize mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Featured Products
                </motion.h2>
                <motion.p
                    className="text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Handpicked items that represent the best of fashion, quality, and style. Each piece is carefully selected to
                    bring you the latest trends and timeless classics.
                </motion.p>
            </motion.div>

            {/* Products Grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                variants={containerVariants}
            >
                {(data?.products || []).map((p, index) => (
                    <ProductCard
                        key={p.id}
                        id={p.id}
                        name={p.name}
                        price={p.price}
                        originalPrice={undefined}
                        image={p.images?.[0] || "/placeholder.svg"}
                        rating={p.averageRating || 0}
                        reviews={p.reviewCount || 0}
                        isNew={false}
                        isSale={false}
                        index={index}
                    />
                ))}
            </motion.div>

            {/* View All Button */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                    <Link href="/products">
                <Button
                    variant="link"
                    size="lg"
                    className="group px-8 py-3 rounded-full border-2 border-ascent text-ascent hover:bg-ascent hover:text-white transition-all duration-300 bg-transparent"
                >
                    <motion.span whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
                        View All Products
                    </motion.span>
                    <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                </Button>
                        </Link>
            </motion.div>
        </motion.section>
    )
}
