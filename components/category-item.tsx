"use client"
import Image from "next/image"
import { motion } from "framer-motion"

interface CategoryItemProps {
    image: string
    title: string
    slug?: string
    index?: number
}

export default function CategoryItem({ image, title, slug, index = 0 }: CategoryItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
            }}
            whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center w-full pb-6 cursor-pointer"
        >
            <motion.div
                className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-md"
                whileHover={{
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2 },
                }}
            >
                <Image
                    src={image || "/placeholder.svg"}
                    alt={title}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                />
            </motion.div>
            <motion.p
                className="text-sm md:text-base mt-3 text-center font-medium text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
            >
                {title}
            </motion.p>
        </motion.div>
    )
}
