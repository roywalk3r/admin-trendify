"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

type CarouselSlide = {
  id: string | number
  title: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  color?: string
}

const fallbackSlides: CarouselSlide[] = [
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
  const { locale } = useParams() as { locale?: string }
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState<CarouselSlide[]>(fallbackSlides)
  const [autoplay, setAutoplay] = useState(true)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Keep links locale-aware without touching styling
  const resolveLink = useMemo(() => {
    return (href: string) => {
      if (!href) return `/${locale ?? ""}/products`
      if (href.startsWith("http")) return href
      if (href.startsWith("/")) return `/${locale ?? ""}${href}`
      return `/${locale ?? ""}/${href}`
    }
  }, [locale])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/admin/hero", { cache: "no-store" })
        if (!res.ok) return
        const json = await res.json()
        const adminSlides = (json?.data?.slides as any[]) || []
        if (!adminSlides.length) return

        const mapped = adminSlides
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((s, idx) => ({
            id: s.id ?? idx,
            title: s.title || "",
            description: s.subtitle || s.description || "",
            image: s.imageUrl || "/placeholder.svg?height=600&width=1200&text=Hero",
            buttonText: s.buttonText || "Shop Now",
            buttonLink: resolveLink(s.buttonUrl || "/products"),
            color: s.color || "bg-blue-50 dark:bg-blue-950/30",
          })) as CarouselSlide[]

        if (mounted && mapped.length) {
          setSlides(mapped)
          setCurrent(0)
        }
      } catch {
        // silent failover to fallback slides
      }
    })()
    return () => {
      mounted = false
    }
  }, [resolveLink])

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const delta = touchStartX.current - touchEndX.current
    if (delta > 40) nextSlide()
    if (delta < -40) prevSlide()
    touchStartX.current = 0
    touchEndX.current = 0
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[360px] w-full">
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
                    <div className="space-y-3 md:space-y-4">
                      <motion.h1
                        className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {slide.title}
                      </motion.h1>
                      <motion.p
                        className="text-base md:text-xl text-muted-foreground"
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
                        <Button size="lg" asChild className="text-sm md:text-base px-5 md:px-6 py-3 md:py-4">
                          <Link href={resolveLink(slide.buttonLink)}>{slide.buttonText}</Link>
                        </Button>
                      </motion.div>
                    </div>
                    <motion.div
                      className="relative h-[240px] sm:h-[320px] md:h-[440px] lg:h-[560px] rounded-lg overflow-hidden bg-background/70"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Image
                        src={slide.image || "/placeholder.svg"}
                        alt={slide.title}
                        width={1200}
                        height={600}
                        className="w-full h-full object-cover object-center"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                        priority={index === 0}
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
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-background transition-colors hidden sm:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-background transition-colors hidden sm:flex"
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
