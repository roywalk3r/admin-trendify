"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaLibrary } from "./media-library"
import { DragDropUpload } from "./drag-drop-upload"

interface MediaFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  createdAt: string
  preview?: string
}

interface MediaManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (files: MediaFile[]) => void
  selectionMode?: "single" | "multiple"
  title?: string
  description?: string
}

export function MediaManager({
  open,
  onOpenChange,
  onSelect,
  selectionMode = "multiple",
  title = "Media Manager",
  description = "Select media files for your content",
}: MediaManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelect = (files: MediaFile[]) => {
    setSelectedFiles(files)
  }

  const handleConfirm = () => {
    onSelect(selectedFiles)
    onOpenChange(false)
    setSelectedFiles([])
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedFiles([])
  }

  const handleUploadComplete = (files: Array<{ id: string; name: string; url: string }>) => {
    // Refresh the media library to show newly uploaded files
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="library" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Media Library</TabsTrigger>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="flex-1 overflow-auto">
              <MediaLibrary
                key={refreshKey}
                onSelect={handleSelect}
                selectionMode={selectionMode}
                selectedFiles={selectedFiles}
              />
            </TabsContent>

            <TabsContent value="upload" className="flex-1 overflow-auto">
              <DragDropUpload
                onUploadComplete={handleUploadComplete}
                maxFiles={20}
                maxSize={50}
                acceptedTypes={["image/*", "video/*", "application/pdf", "text/*"]}
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedFiles.length === 0}>
            Select {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
