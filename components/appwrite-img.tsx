"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface AppwriteImgProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  className?: string
}

export function AppwriteImg({ src, alt, width = "100%", height = "auto", className = "" }: AppwriteImgProps) {
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

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground">{error}</span>
        </div>
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={className}
          style={{ width, height, objectFit: "cover" }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  )
}
