"use client"

import { useState } from "react"
import { AppwriteImage } from "./appwrite-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppwriteGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export function AppwriteGallery({ images, productName, className = "" }: AppwriteGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "")

  // Handle empty images array
  if (images.length === 0) {
    return (
      <div className={cn("aspect-square w-full bg-muted flex items-center justify-center rounded-md", className)}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main image */}
      <div className="aspect-square overflow-hidden rounded-lg border relative">
        <AppwriteImage
          src={selectedImage}
          alt={`${productName} - main image`}
          width={800}
          height={800}
          priority
          className="w-full h-full"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-auto pb-2">
          {images.map((image, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "p-0 w-20 h-20 rounded-md overflow-hidden flex-shrink-0",
                selectedImage === image && "ring-2 ring-primary",
              )}
              onClick={() => setSelectedImage(image)}
            >
              <AppwriteImage
                src={image}
                alt={`${productName} - thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full"
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

