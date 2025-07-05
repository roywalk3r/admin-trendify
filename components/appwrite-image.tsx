"use client"

import { useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface AppwriteImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

export function AppwriteImage({
  src,
  alt,
  width = 500,
  height = 500,
  className = "",
  priority = false,
  objectFit = "cover",
}: AppwriteImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handle image load and error
  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setError("Failed to load image")
  }

  // If no src is provided, show a placeholder
  if (!src) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-muted-foreground">No image</span>
      </div>
    )
  }

  // Use a placeholder for local development if needed
  const imageSrc = src.startsWith("/") ? src : src

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground">{error}</span>
        </div>
      ) : (
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={{ objectFit }}
          priority={priority}
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized={src.includes("appwrite")} // Skip optimization for Appwrite images
        />
      )}
    </div>
  )
}
