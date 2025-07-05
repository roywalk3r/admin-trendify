"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { uploadFile } from "@/lib/appwrite/appwirte-utils"

interface AppwriteUploadProps {
  onUploadSuccess: (urls: string[]) => void
  bucketId?: string
  multiple?: boolean
  buttonText?: string
  className?: string
  disabled?: boolean
  maxFiles?: number
  acceptedFileTypes?: string
}

export function AppwriteUpload({
  onUploadSuccess,
  bucketId,
  multiple = true,
  buttonText = "Upload Images",
  className = "",
  disabled = false,
  maxFiles = 10,
  acceptedFileTypes = "image/*",
}: AppwriteUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if too many files are selected
    if (multiple && files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files at once.`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Track progress (approximate since we can't easily track multiple uploads)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + (100 - prev) * 0.1
          return newProgress > 95 ? 95 : newProgress
        })
      }, 300)

      const uploadPromises = Array.from(files).map((file) => uploadFile(file, bucketId))
      const results = await Promise.all(uploadPromises)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Extract URLs from results
      const urls = results.map((result) => result.url)
      onUploadSuccess(urls)

      toast.success(`${urls.length} file(s) uploaded successfully.`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("There was an error uploading your files. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        multiple={multiple}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading... {Math.round(uploadProgress)}%
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>
    </div>
  )
}

