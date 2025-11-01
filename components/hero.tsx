"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import HeroItem from "./hero-item"
import { useI18n } from "@/lib/i18n/I18nProvider"

interface AdminSlide {
    id: string
    title: string
    subtitle?: string
    description?: string
    imageUrl?: string
    buttonText?: string
    buttonUrl?: string
    isActive: boolean
    order: number
}

export default function Hero() {
    const { t } = useI18n()
    const [slides, setSlides] = useState<AdminSlide[]>([])

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const res = await fetch("/api/admin/hero", { cache: "no-store" })
                if (!res.ok) return
                const json = await res.json()
                const data = (json?.data?.slides as AdminSlide[] | undefined) || []
                if (mounted) setSlides(data.filter(s => s.isActive).sort((a,b) => a.order - b.order))
            } catch {}
        })()
        return () => { mounted = false }
    }, [])

    const hasAdminSlides = slides.length > 0

    return (
        <motion.div
            className="relative w-full max-w-7xl mx-auto p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* Custom Prev Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    variant={"ghost"}
                    className="custom-prev absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <ChevronLeft className="w-6 h-6 text-ascent" />
                </Button>
            </motion.div>

            {/* Custom Next Button */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    variant={"ghost"}
                    className="custom-next bg-ascent absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <ChevronRight className="w-6 h-6 text-ascent" />
                </Button>
            </motion.div>

            {/* Swiper */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <Swiper
                    spaceBetween={30}
                    centeredSlides={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: true,
                    }}
                    pagination={{ clickable: true }}
                    navigation={{
                        prevEl: ".custom-prev",
                        nextEl: ".custom-next",
                    }}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper"
                >
                    {hasAdminSlides ? (
                        slides.map((s) => (
                            <SwiperSlide key={s.id}>
                                <HeroItem
                                    image={s.imageUrl || "/images/hero2.jpg"}
                                    title={s.title}
                                    text={s.subtitle || s.description || ""}
                                    cta={s.buttonText || t("home.hero.slide1.cta")}
                                    href={s.buttonUrl || "/products"}
                                    position={"items-left"}
                                />
                            </SwiperSlide>
                        ))
                    ) : (
                        <>
                            <SwiperSlide>
                                <HeroItem
                                    image={"/images/hero2.jpg"}
                                    title={t("home.hero.slide1.title")}
                                    text={t("home.hero.slide1.text")}
                                    cta={t("home.hero.slide1.cta")}
                                    position={"items-left"}
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <HeroItem
                                    image={"/images/heroImg1.png"}
                                    title={t("home.hero.slide2.title")}
                                    text={t("home.hero.slide2.text")}
                                    cta={t("home.hero.slide2.cta")}
                                    position="items-left"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <HeroItem
                                    image={"/images/hero3.jpg"}
                                    title={t("home.hero.slide3.title")}
                                    text={t("home.hero.slide3.text")}
                                    cta={t("home.hero.slide3.cta")}
                                />
                            </SwiperSlide>
                        </>
                    )}
                </Swiper>
            </motion.div>
        </motion.div>
    )
}
