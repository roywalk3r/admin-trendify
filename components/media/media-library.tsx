"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Grid,
  List,
  Download,
  Copy,
  Trash2,
  FileType,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getMediaFiles, deleteMediaFile } from "@/lib/appwrite/utils";
import { AppwriteImage } from "../appwrite-image";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  preview?: string;
}

interface MediaLibraryProps {
  onSelect?: (files: MediaFile[]) => void;
  selectionMode?: "single" | "multiple";
  selectedFiles?: MediaFile[];
}

export function MediaLibrary({
  onSelect,
  selectionMode = "multiple",
  selectedFiles = [],
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set()
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MediaFile | null>(null);

  // Use ref to track if we're initializing to prevent infinite loops
  const isInitializing = useRef(true);
  const prevSelectedFiles = useRef<MediaFile[]>([]);

  // Load files only once on mount
  useEffect(() => {
    let isMounted = true;

    const loadFiles = async () => {
      try {
        setLoading(true);
        const mediaFiles = await getMediaFiles();
        if (isMounted) {
          setFiles(mediaFiles);
        }
      } catch (error) {
        console.error("Failed to load files:", error);
        if (isMounted) {
          toast.error("Failed to load media files");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isInitializing.current = false;
        }
      }
    };

    loadFiles();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  // Handle selectedFiles prop changes with proper comparison
  useEffect(() => {
    // Skip if we're still initializing or if the arrays are the same
    if (isInitializing.current) return;

    const currentIds = selectedFiles.map((f) => f.id).sort();
    const prevIds = prevSelectedFiles.current.map((f) => f.id).sort();

    // Only update if the selection actually changed
    if (JSON.stringify(currentIds) !== JSON.stringify(prevIds)) {
      setSelectedFileIds(new Set(currentIds));
      prevSelectedFiles.current = [...selectedFiles];
    }
  }, [selectedFiles]);

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((file) => {
        if (filterType === "images") return file.type.startsWith("image/");
        if (filterType === "videos") return file.type.startsWith("video/");
        if (filterType === "documents")
          return (
            !file.type.startsWith("image/") && !file.type.startsWith("video/")
          );
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.size - a.size;
        case "date":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return filtered;
  }, [files, searchQuery, filterType, sortBy]);

  const handleFileSelect = useCallback(
    (file: MediaFile) => {
      if (selectionMode === "single") {
        const newSelected = new Set([file.id]);
        setSelectedFileIds(newSelected);
        onSelect?.([file]);
      } else {
        setSelectedFileIds((prev) => {
          const newSelected = new Set(prev);
          if (newSelected.has(file.id)) {
            newSelected.delete(file.id);
          } else {
            newSelected.add(file.id);
          }

          // Call onSelect with the updated selection
          const selectedFiles = files.filter((f) => newSelected.has(f.id));
          onSelect?.(selectedFiles);

          return newSelected;
        });
      }
    },
    [selectionMode, files, onSelect]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedFileIds.size === filteredAndSortedFiles.length) {
      setSelectedFileIds(new Set());
      onSelect?.([]);
    } else {
      const allIds = new Set(filteredAndSortedFiles.map((f) => f.id));
      setSelectedFileIds(allIds);
      onSelect?.(filteredAndSortedFiles);
    }
  }, [selectedFileIds.size, filteredAndSortedFiles, onSelect]);

  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      await deleteMediaFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setSelectedFileIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file");
    }
  }, []);

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  }, []);

  const handleDownload = useCallback((file: MediaFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="videos">Videos</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: "name" | "date" | "size") =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Selection Controls */}
      {selectionMode === "multiple" && filteredAndSortedFiles.length > 0 && (
        <div className="flex items-center gap-4 p-2 bg-muted/50 rounded">
          <Checkbox
            checked={selectedFileIds.size === filteredAndSortedFiles.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">
            {selectedFileIds.size > 0
              ? `${selectedFileIds.size} of ${filteredAndSortedFiles.length} selected`
              : "Select all"}
          </span>
        </div>
      )}

      {/* File Grid/List */}
      {filteredAndSortedFiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No files found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredAndSortedFiles.map((file) => (
            <Card
              key={file.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFileIds.has(file.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <CardContent className="p-2 relative">
                <div className="aspect-square mb-2 bg-muted rounded overflow-hidden">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.preview || file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileType className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {selectionMode === "multiple" && (
                  <Checkbox
                    checked={selectedFileIds.has(file.id)}
                    className="absolute top-2 left-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyUrl(file.url)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteConfirm(file)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedFiles.map((file) => (
            <Card
              key={file.id}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                selectedFileIds.has(file.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {selectionMode === "multiple" && (
                    <Checkbox
                      checked={selectedFileIds.has(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  <div className="flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.preview || file.url}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                        <FileType className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.createdAt)}</span>
                      <Badge variant="outline">{file.type}</Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyUrl(file.url)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(file)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              <div className="flex justify-center">
                {previewFile.type.startsWith("image/") ? (
                  <AppwriteImage
                    src={previewFile.url || "/placeholder.svg"}
                    alt={previewFile.name}
                    className="max-h-96 object-contain"
                  />
                ) : previewFile.type.startsWith("video/") ? (
                  <video src={previewFile.url} controls className="max-h-96" />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-muted rounded">
                    <FileType className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Size:</strong> {formatFileSize(previewFile.size)}
                </div>
                <div>
                  <strong>Type:</strong> {previewFile.type}
                </div>
                <div>
                  <strong>Created:</strong> {formatDate(previewFile.createdAt)}
                </div>
                <div>
                  <strong>ID:</strong> {previewFile.id}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleCopyUrl(previewFile.url)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button onClick={() => handleDownload(previewFile)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  handleDeleteFile(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
