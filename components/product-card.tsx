"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star, Eye } from "lucide-react"
import { Button } from "./ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string | StaticImageData
    rating: number
    reviews: number
    isNew?: boolean
    isSale?: boolean
    index: number
}

export default function ProductCard({
                                        id,
                                        name,
                                        price,
                                        originalPrice,
                                        image,
                                        rating,
                                        reviews,
                                        isNew,
                                        isSale,
                                        index = 0,
                                    }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isWishlistLoading, setIsWishlistLoading] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const addToCartStore = useCartStore((s) => s.addItem)
    const { toast } = useToast()

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
            },
        },
    }

    const imageVariants: Variants = {
        rest: { scale: 1 },
        hover: {
            scale: 1.05,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    }

    const overlayVariants: Variants = {
        rest: { opacity: 0, y: 20 },
        hover: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    }

    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

    const imgSrc = typeof image === "string" ? image : (image as StaticImageData).src

    // initialize wishlist heart state from server
    useEffect(() => {
        let mounted = true
        const check = async () => {
            try {
                const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(id)}`, { cache: "no-store" })
                if (!res.ok) return
                const json = await res.json()
                const inWishlist = json?.data?.inWishlist ?? json?.inWishlist
                if (mounted && typeof inWishlist === "boolean") setIsWishlisted(inWishlist)
            } catch {}
        }
        check()
        return () => {
            mounted = false
        }
    }, [id])

    const handleAddToCart = async () => {
        // optimistic local add
        addToCartStore({ id, name, price, quantity: 1, image: imgSrc })
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name, price, quantity: 1, image: imgSrc }),
            })
            if (!res.ok) throw new Error(`${res.status}`)
            toast({ title: "Added to cart", description: name })
        } catch (e: any) {
            // server may fail if unauthenticated; keep local cart but inform user
            const msg = String(e?.message || "")
            if (msg === "401") {
                toast({ title: "Sign in to sync your cart", description: "Item kept locally.", variant: "destructive" })
            } else {
                toast({ title: "Failed to sync cart", description: msg, variant: "destructive" })
            }
        }
    }

    const toggleWishlist = async () => {
        if (isWishlistLoading) return
        const next = !isWishlisted
        setIsWishlisted(next) // optimistic
        setIsWishlistLoading(true)
        try {
            if (next) {
                const res = await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: id }),
                })
                if (!res.ok) throw new Error(await res.text())
                toast({ title: "Added to wishlist", description: name })
                // notify global listeners (e.g., header) to refresh count
                window.dispatchEvent(new Event("wishlist:updated"))
            } else {
                const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(id)}`, { method: "DELETE" })
                if (!res.ok) throw new Error(await res.text())
                toast({ title: "Removed from wishlist", description: name })
                window.dispatchEvent(new Event("wishlist:updated"))
            }
        } catch (e: any) {
            // revert on error
            setIsWishlisted(!next)
            toast({ title: "Wishlist action failed", description: e?.message || "", variant: "destructive" })
        } finally {
            setIsWishlistLoading(false)
        }
    }

    return (
        <motion.div
            className="group relative bg-card rounded-2xl border border-muted overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            animate={isHovered ? "hover" : "rest"}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <motion.div variants={imageVariants} className="w-full h-full">
                    <Link href={`/products/${id}`} className="block w-full h-full">
                        <Image
                            src={imgSrc || "/placeholder.svg"}
                            alt={name}
                            fill
                            className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                    </Link>
                </motion.div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isNew && (
                        <motion.span
                            className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            NEW
                        </motion.span>
                    )}
                    {isSale && discount > 0 && (
                        <motion.span
                            className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            -{discount}%
                        </motion.span>
                    )}
                </div>

                {/* Wishlist Button */}
                <motion.button
                    className="absolute top-3 z-10 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleWishlist}
                    disabled={isWishlistLoading}
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                </motion.button>

                {/* Hover Overlay */}
                <motion.div
                    className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2"
                    variants={overlayVariants}
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Link href={`/products/${id}`} className="p-3 bg-white rounded-full shadow-lg block">
                            <Eye className="w-5 h-5 text-gray-700" />
                        </Link>
                    </motion.div>
                    <motion.button
                        className="p-3 bg-ascent text-white rounded-full shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <Link href={`/products/${id}`}>
                    <motion.h3
                        className="font-semibold typography text-sm text-ascent mb-2 line-clamp-2 cursor-pointer hover:underline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        key={index}
                    >
                        {name}
                    </motion.h3>
                </Link>

                {/* Rating */}
                <motion.div
                    className="flex items-center gap-1 mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                >
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-1">({reviews})</span>
                </motion.div>

                {/* Price */}
                <motion.div
                    className="flex items-center gap-2 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                >
                    <span className="text-xl text-foreground typography">${price}</span>
                    {originalPrice && <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>}
                </motion.div>

                {/* Add to Cart Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.6 }}
                >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.5 }}>
                        <Button
                            variant={"ghost"}
                            className="w-full bg-ascent-foreground hover:bg-ascent hover:text-white transition ease-in-out delay-250 duration-300 text-ascent font-semibold py-2 rounded-full
                         motion-reduce:transition-none "
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    )
}
