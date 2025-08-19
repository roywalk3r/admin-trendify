
"use client"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

interface HeroItems {
    image: string
    title: string
    text: string
    cta: string
    position?: string
    style?: string
}

export default function HeroCard({ image, title, text, cta, position, style }: HeroItems) {
    return (
        <div
            className={`relative w-full h-[600px] ${position ? position : "items-center"} rounded-3xl flex flex-col justify-end p-12 bg-cover bg-center overflow-hidden`}
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${image})` }}
        >
            {/* Floating sparkles */}
            <motion.div
                className="absolute top-20 left-20"
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            >
                <Sparkles className="w-10 h-10 text-white/60" />
            </motion.div>

            <motion.div
                className="absolute top-32 right-32"
                animate={{
                    y: [0, 15, 0],
                    rotate: [0, -180, -360],
                }}
                transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 2,
                }}
            >
                <Sparkles className="w-12 h-12 text-white/40" />
            </motion.div>

            {/* Content */}
            <motion.div className="relative z-10 max-w-2xl">
                <motion.h2
                    className="text-white text-5xl md:text-6xl lg:text-7xl font-bold mb-4 typography leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {title}
                </motion.h2>

                <motion.p
                    className={`text-white/90 text-lg md:text-xl mb-8 ${style ? style : ""} leading-relaxed`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {text}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >

<Button  variant={"ghost"} className="group glass bg-white px-6 py-3 rounded-full text-ascent font-semibold w-fit typography text-lg  hover:bg-ascent-foreground/20 hover:text-white hover:shadow-lg hover:border-ascent transition-all duration-300">
                        <span className="mr-2">{cta}</span>
                        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                            <ArrowRight className="w-5 h-5" />
                        </motion.div>
                    </Button>
                </motion.div>
            </motion.div>

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
    )
}
