"use client"
import { motion } from "framer-motion"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import HeroItem from "./hero-item"

export default function Hero() {
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
                    <SwiperSlide>
                        <HeroItem
                            image={"/images/hero2.jpg"}
                            title={"Elevate Your Style"}
                            text={"Discover premium fashion that defines your unique personality"}
                            cta={"Explore Collection"}
                            position={"items-left"}
                        />
                    </SwiperSlide>
                    <SwiperSlide>
                        <HeroItem
                            image={"/images/heroImg1.png"}
                            title={"Trending Now"}
                            text={"Stay ahead with the latest fashion trends and exclusive pieces"}
                            cta={"Shop Trends"}
                            position="items-left"
                        />
                    </SwiperSlide>
                    <SwiperSlide>
                        <HeroItem
                            image={"/images/hero3.jpg"}
                            title={"New Arrivals"}
                            text={"Fresh styles just landed - be the first to wear them"}
                            cta={"See What's New"}
                        />
                    </SwiperSlide>
                </Swiper>
            </motion.div>
        </motion.div>
    )
}
