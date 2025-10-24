"use client";

import { useState, useCallback } from "react";
import { Plus, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropUpload } from "@/components/media/drag-drop-upload";
import { MediaLibrary } from "@/components/media/media-library";
import { MediaManager } from "@/components/media/media-manager";

export default function MediaPage() {
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = useCallback(
    (files: Array<{ id: string; name: string; url: string }>) => {
      console.log("Files uploaded:", files);
      // Refresh the media library to show newly uploaded files
      setRefreshKey((prev) => prev + 1);
    },
    []
  );

  const handleMediaSelect = useCallback((files: any[]) => {
    console.log("Selected files:", files);
    // Handle selected files from the media manager
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your media files and assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowMediaManager(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Media Manager
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB</div>
            <p className="text-xs text-muted-foreground">of 10 GB available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Uploads
            </CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="library" className="space-y-4">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Files</CardTitle>
              <CardDescription>
                Browse and manage your uploaded media files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaLibrary key={refreshKey} onSelect={handleMediaSelect} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop files or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropUpload
                onUploadComplete={handleUploadComplete}
                maxFiles={20}
                maxSize={50}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MediaManager
        open={showMediaManager}
        onOpenChange={setShowMediaManager}
        onSelect={handleMediaSelect}
        selectionMode="multiple"
        title="Select Media Files"
        description="Choose files from your media library"
      />
    </div>
  );
}
