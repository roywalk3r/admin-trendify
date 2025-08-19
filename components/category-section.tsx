"use client"
import { motion } from "framer-motion"
import CategoryItem from "./category-item"
import type { Variants } from "framer-motion"

export default function Category() {
    const categories = [
        { image: "/images/men.jpg", title: "Men's Fashion" },
        { image: "/images/hero3.jpg", title: "Women's Fashion" },
        { image: "/images/kids.jpg", title: "Kids & Baby" },
        { image: "/images/accessories.jpg", title: "Accessories" },
        { image: "/images/shoes.jpg", title: "Shoes" },
        { image: "/images/bags.jpg", title: "Bags" },
        { image: "/images/jewel.jpg", title: "Jewelry" },
        { image: "/images/sports.jpg", title: "Sports" },
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
        <motion.div
            className="relative w-full max-w-7xl mx-auto p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <motion.div className="mb-8" variants={headerVariants}>
                <motion.span
                    className="font-light text-2xl text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    explore
                </motion.span>
                <motion.h1
                    className="typography text-3xl md:text-4xl capitalize"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Categories
                </motion.h1>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6"
                variants={containerVariants}
            >
                {categories.map((category, index) => (
                    <CategoryItem key={index} image={category.image} title={category.title} index={index} />
                ))}
            </motion.div>
        </motion.div>
    )
}
