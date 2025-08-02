"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, CheckCircle, AlertCircle, RefreshCw, File, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { uploadToAppwrite } from "@/lib/appwrite/utils"
import Image from "next/image"

interface FileUpload {
  id: string
  file: File
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
  preview?: string
  appwriteId?: string
}

interface DragDropUploadProps {
  onUploadComplete?: (files: Array<{ id: string; name: string; url: string }>) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function DragDropUpload({
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ["image/*", "video/*", "application/pdf", ".doc", ".docx"],
}: DragDropUploadProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const uploadIdCounter = useRef(0)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        toast.error(`${file.name}: ${error.message}`)
      })
    })

    // Process accepted files
    const newUploads: FileUpload[] = acceptedFiles.map((file) => {
      const id = `upload-${++uploadIdCounter.current}`
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined

      return {
        id,
        file,
        status: "pending" as const,
        progress: 0,
        preview,
      }
    })

    setUploads((prev) => [...prev, ...newUploads])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploads.length,
    maxSize: maxSize * 1024 * 1024,
    accept: acceptedTypes.reduce(
      (acc, type) => {
        acc[type] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
    disabled: isUploading || uploads.length >= maxFiles,
  })

  const uploadFile = async (upload: FileUpload) => {
    setUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, status: "uploading", progress: 0 } : u)))

    try {
      const result = await uploadToAppwrite(upload.file, (progress) => {
        setUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, progress } : u)))
      })

      setUploads((prev) =>
        prev.map((u) => (u.id === upload.id ? { ...u, status: "success", progress: 100, appwriteId: result.id } : u)),
      )

      return { id: result.id, name: upload.file.name, url: result.url }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      setUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, status: "error", error: errorMessage } : u)))
      throw error
    }
  }

  const uploadAll = async () => {
    const pendingUploads = uploads.filter((u) => u.status === "pending")
    if (pendingUploads.length === 0) return

    setIsUploading(true)
    const uploadedFiles: Array<{ id: string; name: string; url: string }> = []

    try {
      for (const upload of pendingUploads) {
        try {
          const result = await uploadFile(upload)
          uploadedFiles.push(result)
        } catch (error) {
          console.error(`Failed to upload ${upload.file.name}:`, error)
        }
      }

      if (uploadedFiles.length > 0) {
        toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`)
        onUploadComplete?.(uploadedFiles)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id)
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview)
      }
      return prev.filter((u) => u.id !== id)
    })
  }

  const retryUpload = async (id: string) => {
    const upload = uploads.find((u) => u.id === id)
    if (!upload) return

    try {
      await uploadFile(upload)
    } catch (error) {
      console.error("Retry failed:", error)
    }
  }

  const clearCompleted = () => {
    setUploads((prev) => {
      prev.forEach((upload) => {
        if (upload.preview && upload.status === "success") {
          URL.revokeObjectURL(upload.preview)
        }
      })
      return prev.filter((u) => u.status !== "success")
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${isUploading || uploads.length >= maxFiles ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">{isDragActive ? "Drop files here..." : "Drag & drop files here"}</p>
          <p className="text-sm text-muted-foreground">
            or click to browse ({uploads.length}/{maxFiles} files)
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxSize}MB per file • {acceptedTypes.join(", ")}
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Upload Queue</h3>
            <div className="flex gap-2">
              <Button
                onClick={clearCompleted}
                variant="outline"
                size="sm"
                disabled={!uploads.some((u) => u.status === "success")}
              >
                Clear Completed
              </Button>
              <Button
                onClick={uploadAll}
                disabled={isUploading || !uploads.some((u) => u.status === "pending")}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload All (${uploads.filter((u) => u.status === "pending").length})`
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {uploads.map((upload) => {
              const FileIcon = getFileIcon(upload.file)

              return (
                <Card key={upload.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {upload.preview ? (
                          <Image
                            src={upload.preview || "/placeholder.svg"}
                            alt={upload.file.name}
                            width={48}
                            height={48}
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{upload.file.name}</p>
                          <Badge
                            variant={
                              upload.status === "success"
                                ? "default"
                                : upload.status === "error"
                                  ? "destructive"
                                  : upload.status === "uploading"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {upload.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatFileSize(upload.file.size)}</p>

                        {/* Progress Bar */}
                        {upload.status === "uploading" && <Progress value={upload.progress} className="mt-2" />}

                        {/* Error Message */}
                        {upload.status === "error" && upload.error && (
                          <p className="text-xs text-destructive mt-1">{upload.error}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {upload.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {upload.status === "error" && (
                          <>
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <Button onClick={() => retryUpload(upload.id)} size="sm" variant="outline">
                              Retry
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => removeUpload(upload.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
