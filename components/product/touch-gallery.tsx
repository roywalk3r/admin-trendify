"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"

interface TouchGalleryProps {
  images: string[]
  productName: string
  isNew?: boolean
  isSale?: boolean
  discount?: number
  className?: string
}

export default function TouchGallery({ 
  images, 
  productName, 
  isNew, 
  isSale, 
  discount,
  className 
}: TouchGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isMobile = useMediaQuery("(max-width: 768px)")
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    resetZoom()
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    resetZoom()
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 4))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 1))
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handlePanEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    if (!isFullscreen && Math.abs(info.offset.x) > 50) {
      if (info.offset.x > 0) {
        prevImage()
      } else {
        nextImage()
      }
    } else if (isFullscreen && scale > 1) {
      // Handle panning when zoomed
      const newX = position.x + info.offset.x
      const newY = position.y + info.offset.y
      
      // Add bounds checking
      const maxX = (scale - 1) * 150
      const maxY = (scale - 1) * 150
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      })
    }
  }

  const handleDoubleTap = () => {
    if (scale === 1) {
      setScale(2)
    } else {
      resetZoom()
    }
  }

  // Touch gesture detection
  const [lastTap, setLastTap] = useState(0)
  const handleTouchEnd = () => {
    const now = Date.now()
    const timeSince = now - lastTap
    if (timeSince < 300 && timeSince > 0) {
      handleDoubleTap()
    }
    setLastTap(now)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'Escape':
          setIsFullscreen(false)
          resetZoom()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
          resetZoom()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen])

  return (
    <>
      {/* Main Gallery */}
      <div className={`relative ${className}`} ref={containerRef}>
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <motion.div
            className="relative w-full h-full cursor-pointer"
            onClick={() => !isMobile && setIsFullscreen(true)}
            onTouchEnd={handleTouchEnd}
            drag={isMobile ? "x" : false}
            dragConstraints={containerRef}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handlePanEnd}
            whileDrag={{ cursor: "grabbing" }}
          >
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`${productName} - Image ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={currentIndex === 0}
            />
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isNew && (
              <Badge className="bg-green-500 text-white">
                New
              </Badge>
            )}
            {isSale && discount && (
              <Badge className="bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Navigation Arrows (Desktop) */}
          {!isMobile && images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Fullscreen Button (Desktop) */}
          {!isMobile && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm"
              onClick={() => setIsFullscreen(true)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentIndex
                    ? "border-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setCurrentIndex(index)
                  resetZoom()
                }}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Mobile Swipe Indicator */}
        {isMobile && images.length > 1 && !isDragging && (
          <div className="absolute bottom-3 right-3 z-10">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-xs">
              Swipe →
            </Badge>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Close Button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-20 bg-white/20 border-white/20 text-white hover:bg-white/30"
              onClick={() => {
                setIsFullscreen(false)
                resetZoom()
              }}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/20 border-white/20 text-white hover:bg-white/30"
                onClick={handleZoomIn}
                disabled={scale >= 4}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/20 border-white/20 text-white hover:bg-white/30"
                onClick={handleZoomOut}
                disabled={scale <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/20 border-white/20 text-white hover:bg-white/30"
                onClick={resetZoom}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 border-white/20 text-white hover:bg-white/30"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 border-white/20 text-white hover:bg-white/30"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <Badge className="bg-white/20 border-white/20 text-white">
                {currentIndex + 1} / {images.length}
              </Badge>
            </div>

            {/* Zoomable Image */}
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
              drag={scale > 1}
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              onDragEnd={handlePanEnd}
              animate={{
                scale,
                x: position.x,
                y: position.y
              }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                ref={imageRef}
                src={images[currentIndex]}
                alt={`${productName} - Image ${currentIndex + 1}`}
                width={800}
                height={800}
                className="w-full h-full object-contain"
                style={{
                  cursor: scale > 1 ? "grab" : "default"
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
