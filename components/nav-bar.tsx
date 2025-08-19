"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { HeartIcon, SearchIcon, ShoppingBag, Menu, X, LockKeyhole } from "lucide-react"
import { SignedOut, SignInButton, useAuth } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from "next/link"
import SearchModal from "./search-modal"
import CartSidebar from "./cart-sidebar"
import WishlistSidebar from "./wishlist-sidebar"

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isWishlistOpen, setIsWishlistOpen] = useState(false)
    const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navVariants: Variants = {
        hidden: { y: -100, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: { y: -20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 },
        },
    }

    const mobileMenuVariants: Variants = {
        hidden: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
        visible: {
            opacity: 1,
            height: "auto",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    }

    const mobileItemVariants: Variants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.3 },
        },
    }

    const searchVariants: Variants = {
        hidden: { width: 0, opacity: 0 },
        visible: {
            width: "auto",
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    }

    const navItems = [
        { name: "New Arrivals", href: "/new-arrivals" },
        { name: "Men", href: "/men" },
        { name: "Women", href: "/women" },
        { name: "Accessories", href: "/accessories" },
        { name: "Sale", href: "/sale" },
    ]

    return (
        <>
            <motion.header
                className={`flex items-center justify-between w-full sticky top-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? "bg-background/95 backdrop-blur-md border-b shadow-sm py-2 px-4"
                        : "bg-background border-b py-4 px-4"
                }`}
                initial="hidden"
                animate="visible"
                variants={navVariants}
            >
                {/* Logo */}
                <Link href={"/"}>
                    <motion.div className="flex gap-2 items-center" variants={itemVariants}>
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                            <Image src={"/images/logo.svg"} className={"dark:invert"} width={24} height={24} alt={"Logo"} />
                        </motion.div>
                        <motion.h1
                            className={"typography text-xl md:text-2xl capitalize"}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            Trendify
                        </motion.h1>
                    </motion.div>
                </Link>

                {/* Desktop Navigation */}
                <motion.nav className={"hidden lg:flex gap-6 items-center"} variants={itemVariants}>
                    <ul className={"flex gap-6"}>
                        {navItems.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                whileHover={{ y: -2 }}
                            >
                                <Link href={item.href}>
                                    <motion.span
                                        className={"typography text-sm font-medium hover:text-ascent transition-colors relative"}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {item.name}
                                        <motion.div
                                            className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ascent"
                                            whileHover={{ width: "100%" }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    </motion.span>
                                </Link>
                            </motion.div>
                        ))}
                    </ul>
                </motion.nav>

                {/* Desktop Actions */}
                <motion.div className={"hidden md:flex gap-3 items-center"} variants={itemVariants}>
                    {/* Search */}
                    <motion.div
                        className={"bg-[#F5F0F0] flex items-center rounded-3xl overflow-hidden"}
                        whileHover={{ scale: 1.02 }}
                        layout
                    >
                        <motion.button
                            className="p-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsSearchModalOpen(true)}
                        >
                            <SearchIcon className={"text-[#8A6163] w-5 h-5"} />
                        </motion.button>
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.div variants={searchVariants} initial="hidden" animate="visible" exit="hidden">
                                    <Input
                                        type={"search"}
                                        placeholder={"Search"}
                                        className={
                                            "placeholder:text-ascent border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-48"
                                        }
                                        onFocus={() => {
                                            setIsSearchOpen(false)
                                            setIsSearchModalOpen(true)
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Action Icons */}
                    <motion.div className={"flex gap-3 items-center"}>
                        <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full hover:bg-[#F5F0F0] transition-colors relative"
                            onClick={() => setIsWishlistOpen(true)}
                        >
                            <HeartIcon className={"text-[#8A6163] w-5 h-5"} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full hover:bg-[#F5F0F0] transition-colors relative"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag className={"text-[#8A6163] w-5 h-5"} />
                            <span className="absolute -top-1 -right-1 bg-ascent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                2
              </span>
                        </motion.button>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="cursor-pointer">
                            {isSignedIn ? (
                                <Image
                                    src="/images/avatar.png"
                                    className="dark:invert rounded-full"
                                    width={32}
                                    height={32}
                                    alt="Avatar"
                                />
                            ) : (
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button variant={"outline"} className="bg-ascent text-ascent-foreground">
                                            Sign in
                                            <LockKeyhole className="w-5 h-5" />
                                        </Button>
                                    </SignInButton>
                                </SignedOut>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Mobile Actions */}
                <motion.div className={"flex md:hidden gap-2 items-center"} variants={itemVariants}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full hover:bg-[#F5F0F0] transition-colors"
                        onClick={() => setIsSearchModalOpen(true)}
                    >
                        <SearchIcon className={"text-[#8A6163] w-5 h-5"} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full hover:bg-[#F5F0F0] transition-colors relative"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingBag className={"text-[#8A6163] w-5 h-5"} />
                        <span className="absolute -top-1 -right-1 bg-ascent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
              2
            </span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-full hover:bg-[#F5F0F0] transition-colors lg:hidden"
                    >
                        <AnimatePresence mode="wait">
                            {isMobileMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className={"text-[#8A6163] w-5 h-5"} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu className={"text-[#8A6163] w-5 h-5"} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </motion.div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            className="absolute top-full left-0 w-full bg-background border-b shadow-lg lg:hidden"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="p-4 space-y-4">
                                {/* Mobile Navigation */}
                                <motion.nav variants={mobileItemVariants}>
                                    <ul className="space-y-3">
                                        {navItems.map((item, index) => (
                                            <motion.li key={item.name} variants={mobileItemVariants} whileHover={{ x: 5 }}>
                                                <Link
                                                    href={item.href}
                                                    className="typography text-base font-medium hover:text-ascent transition-colors block py-2"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.nav>

                                {/* Mobile User Actions */}
                                <motion.div className="flex items-center justify-between pt-4 border-t" variants={mobileItemVariants}>
                                    <div className="flex gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="flex items-center gap-2 text-sm typography"
                                            onClick={() => {
                                                setIsWishlistOpen(true)
                                                setIsMobileMenuOpen(false)
                                            }}
                                        >
                                            <HeartIcon className={"text-[#8A6163] w-4 h-4"} />
                                            Wishlist
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="flex items-center gap-2 text-sm typography"
                                            onClick={() => {
                                                setIsCartOpen(true)
                                                setIsMobileMenuOpen(false)
                                            }}
                                        >
                                            <ShoppingBag className={"text-[#8A6163] w-4 h-4"} />
                                            Cart
                                        </motion.button>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Image
                                            src={"/images/avatar.png"}
                                            className={"dark:invert rounded-full"}
                                            width={28}
                                            height={28}
                                            alt={"Avatar"}
                                        />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Modals and Sidebars */}
            <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </>
    )
}
