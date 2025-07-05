"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    title: "Summer Collection 2023",
    description: "Discover our latest arrivals for the summer season. Fresh styles for every occasion.",
    image: "/placeholder.svg?height=600&width=1200&text=Summer+Collection",
    buttonText: "Shop Now",
    buttonLink: "/products?category=summer",
    color: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: 2,
    title: "Premium Electronics",
    description: "Explore our range of high-quality electronics. The latest tech at competitive prices.",
    image: "/placeholder.svg?height=600&width=1200&text=Premium+Electronics",
    buttonText: "Discover More",
    buttonLink: "/products?category=electronics",
    color: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: 3,
    title: "Home Essentials",
    description: "Transform your living space with our curated collection of home essentials.",
    image: "/placeholder.svg?height=600&width=1200&text=Home+Essentials",
    buttonText: "View Collection",
    buttonLink: "/products?category=home",
    color: "bg-amber-50 dark:bg-amber-950/30",
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const nextSlide = () => {
    setAutoplay(false)
    setCurrent(current === slides.length - 1 ? 0 : current + 1)
  }

  const prevSlide = () => {
    setAutoplay(false)
    setCurrent(current === 0 ? slides.length - 1 : current - 1)
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative h-[500px] md:h-[600px] w-full">
        <AnimatePresence mode="wait">
          {slides.map(
            (slide, index) =>
              index === current && (
                <motion.div
                  key={slide.id}
                  className={`absolute inset-0 ${slide.color} flex items-center`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <motion.h1
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {slide.title}
                      </motion.h1>
                      <motion.p
                        className="text-lg text-muted-foreground md:text-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {slide.description}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <Button size="lg" asChild>
                          <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                        </Button>
                      </motion.div>
                    </div>
                    <motion.div
                      className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <img
                        src={slide.image || "/placeholder.svg"}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-background transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-background transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setAutoplay(false)
              setCurrent(index)
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === current ? "bg-primary w-8" : "bg-primary/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
