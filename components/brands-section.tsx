"use client"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import Image from "next/image"

export default function BrandsSection() {
    const brands = [
        { name: "Nike", logo: "/images/Nike.svg" },
        { name: "Adidas", logo: "/images/Adidas.svg" },
        { name: "Zara", logo: "/images/Zara.svg" },
        { name: "H&M", logo: "/images/hm.svg" },
        { name: "Uniqlo", logo: "/images/UNIQLO.svg" },
        { name: "Gucci", logo: "/images/Gucci.svg" },
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

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    }

    return (
        <motion.section
            className="relative w-full bg-muted/30 py-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-8">
                <motion.div className="text-center mb-12" variants={itemVariants}>
                    <motion.h2
                        className="typography text-2xl md:text-3xl text-muted-foreground mb-2"
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Trusted by Leading Brands
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        We partner with the world's most iconic fashion brands
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
                    variants={containerVariants}
                >
                    {brands.map((brand, index) => (
                        <motion.div
                            key={brand.name}
                            className="flex items-center justify-center p-6 bg-background rounded-xl hover:shadow-md transition-shadow duration-300"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Image
                                src={brand.logo || "/placeholder.svg"}
                                alt={brand.name}
                                width={80}
                                height={40}
                                className="opacity-60 hover:opacity-100 transition-opacity duration-300 dark:invert"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
    )
}
