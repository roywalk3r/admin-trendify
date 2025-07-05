"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Search, ImageIcon, Trash2 } from "lucide-react"
import { AppwriteImg } from "./appwrite-img"
import { listFiles, deleteFile, extractFileIdFromUrl } from "@/lib/appwrite/appwirte-utils"

interface AppwriteMediaBrowserProps {
  onSelect: (urls: string[]) => void
  maxSelections?: number
  buttonText?: string
  triggerClassName?: string
  bucketId?: string
  selectedImages?: string[]
  allowDelete?: boolean
}

export function AppwriteMediaBrowser({
  onSelect,
  maxSelections = 10,
  buttonText = "Select Images",
  triggerClassName = "",
  bucketId,
  selectedImages = [],
  allowDelete = false,
}: AppwriteMediaBrowserProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mediaAssets, setMediaAssets] = useState<{ id: string; name: string; url: string }[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch media assets from Appwrite Storage
  const fetchMediaAssets = async () => {
    setIsLoading(true)
    try {
      const files = await listFiles(bucketId)
      setMediaAssets(files)
    } catch (error) {
      console.error("Error fetching media assets:", error)
      toast.error("Failed to load media assets")
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (isOpen) {
      fetchMediaAssets()
    }
  }, [isOpen, bucketId])

  // Handle asset selection
  const handleAssetSelect = (url: string) => {
    setSelectedAssets((prev) => {
      // If already selected, remove it
      if (prev.includes(url)) {
        return prev.filter((id) => id !== url)
      }

      // If max selections reached, show warning and don't add
      if (prev.length >= maxSelections) {
        toast.error(`You can only select up to ${maxSelections} images`)
        return prev
      }

      // Add to selection
      return [...prev, url]
    })
  }

  // Handle delete asset
  const handleDeleteAsset = async (url: string) => {
    if (!allowDelete) return

    setIsDeleting(true)
    try {
      const fileId = extractFileIdFromUrl(url)
      if (!fileId) {
        throw new Error("Could not extract file ID from URL")
      }

      await deleteFile(fileId, bucketId)

      // Remove from media assets
      setMediaAssets((prev) => prev.filter((asset) => asset.url !== url))

      // Remove from selected assets if selected
      setSelectedAssets((prev) => prev.filter((id) => id !== url))

      toast.success("The file has been deleted successfully.")
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("There was an error deleting the file. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle confirm selection
  const handleConfirmSelection = () => {
    onSelect(selectedAssets)
    setIsOpen(false)
  }

  // Filter assets based on search query
  const filteredAssets = searchQuery
    ? mediaAssets.filter((asset) => asset.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mediaAssets

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          <ImageIcon className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mediaAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p>No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
              {filteredAssets.map((asset, index) => (
                <div
                  key={index}
                  className={`relative group cursor-pointer rounded-md overflow-hidden border-2 ${
                    selectedAssets.includes(asset.url) ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => handleAssetSelect(asset.url)}
                >
                  <AppwriteImg src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />

                  {allowDelete && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteAsset(asset.url)
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedAssets.length} of {maxSelections} images selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection} disabled={selectedAssets.length === 0}>
              Select {selectedAssets.length > 0 ? `(${selectedAssets.length})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

