"use client"
import { motion } from "framer-motion"
import CategoryItem from "./category-item"
import type { Variants } from "framer-motion"
import { useApi } from "@/lib/hooks/use-api"

export default function Category() {
    // Fetch categories from backend API. We avoid passing parentId due to API filtering semantics.
    const { data, isLoading, error } = useApi(`/api/categories?limit=16&sortBy=name&sortOrder=asc`)
    const categories = (data as Array<any>) || []
// console.log(data, "Categories")
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

            {/* Error state */}
            {error && (
                <div className="text-sm text-red-500">Failed to load categories.</div>
            )}

            {/* Grid */}
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6"
                variants={containerVariants}
            >
                {/* Loading skeletons */}
                {isLoading && !categories.length &&
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex flex-col items-center w-full pb-6 animate-pulse">
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-muted" />
                            <div className="h-4 w-16 mt-3 bg-muted rounded" />
                        </div>
                    ))}

                {/* Loaded categories */}
                {!isLoading && categories.map((category: any, index: number) => (
                    <CategoryItem
                        key={category.id || index}
                        image={category.image || "/placeholder.svg"}
                        title={category.name}
                        slug={category.slug}
                        index={index}
                    />
                ))}
            </motion.div>
        </motion.div>
    )
}
