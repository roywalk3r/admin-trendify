"use client"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import ProductCard from "./product-card"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"
import {all_products} from "@/public/images/data";

export default function FeaturedProducts() {
    const featuredProducts = [
        {
            id: "1",
            name: "Premium Cotton T-Shirt",
            price: 29.99,
            originalPrice: 39.99,
            image: "/images/product_1.png",
            rating: 4.5,
            reviews: 128,
            isNew: true,
            isSale: true,
        },
        {
            id: "2",
            name: "Designer Denim Jacket",
            price: 89.99,
            originalPrice: 120.0,
            image: "/images/product_2.png",
            rating: 4.8,
            reviews: 89,
            isNew: false,
            isSale: true,
        },
        {
            id: "3",
            name: "Casual Summer Dress",
            price: 45.99,
            image: "/images/product_3.png",
            rating: 4.6,
            reviews: 156,
            isNew: true,
            isSale: false,
        },
        {
            id: "4",
            name: "Classic Leather Boots",
            price: 129.99,
            originalPrice: 159.99,
            image: "/images/product_4.png",
            rating: 4.7,
            reviews: 203,
            isNew: false,
            isSale: true,
        },
        {
            id: "5",
            name: "Vintage Graphic Hoodie",
            price: 59.99,
            image: "/images/product_5.png",
            rating: 4.4,
            reviews: 94,
            isNew: true,
            isSale: false,
        },
        {
            id: "6",
            name: "Elegant Evening Gown",
            price: 199.99,
            originalPrice: 249.99,
            image: "/images/product_6.png",
            rating: 4.9,
            reviews: 67,
            isNew: false,
            isSale: true,
        },
        {
            id: "7",
            name: "Sports Performance Shorts",
            price: 34.99,
            image: "/images/product_7.png",
            rating: 4.3,
            reviews: 112,
            isNew: true,
            isSale: false,
        },
        {
            id: "8",
            name: "Luxury Silk Scarf",
            price: 79.99,
            originalPrice: 99.99,
            image: "/images/product_8.png",
            rating: 4.6,
            reviews: 45,
            isNew: false,
            isSale: true,
        },
    ]

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
                {Array.from({ length: 8 })
                    .map((_, index) => all_products[Math.floor(Math.random() * all_products.length)])
                    .map((product: any) => ({
                        ...product,
                        rating: product.rating || 0,  // Default to 0 if not provided
                        reviews: product.reviews || 0, // Default to 0 if not provided
                        originalPrice: product.originalPrice || product.price, // Use price as originalPrice if not provided
                        isNew: product.isNew || false,
                        isSale: product.isSale || false
                    }))
                    .map((product, index) => (
                        <ProductCard 
                            key={`${product.id}-${index}`}
                            {...product}
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
                <Button
                    variant="outline"
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
            </motion.div>
        </motion.section>
    )
}
