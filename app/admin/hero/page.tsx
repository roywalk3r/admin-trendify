"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react";
import { useApi, useApiMutation } from "@/lib/hooks/use-api";
import { AppwriteMediaBrowser } from "@/components/appwrite/appwrite-media-browser";
import { AppwriteImg } from "@/components/appwrite/appwrite-img";

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface HeroFormData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
}

export default function HeroManagementPage() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [deleteSlideId, setDeleteSlideId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HeroFormData>({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    buttonText: "",
    buttonUrl: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<HeroFormData>>({});

  const {
    data: slidesResponse,
    isLoading,
    refetch,
  } = useApi<{ data: HeroSlide[] }>("/api/admin/hero");

  const { mutate: createSlide, isLoading: isCreating } = useApiMutation(
    "/api/admin/hero",
    "POST",
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Hero slide created successfully.",
        });
        refetch();
        setIsCreateDialogOpen(false);
        resetForm();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to create hero slide: ${error}`,
          variant: "destructive",
        });
      },
    }
  );

  const { mutate: updateSlide, isLoading: isUpdating } = useApiMutation(
    "/api/admin/hero",
    "PATCH",
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Hero slide updated successfully.",
        });
        refetch();
        setIsEditDialogOpen(false);
        resetForm();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update hero slide: ${error}`,
          variant: "destructive",
        });
      },
    }
  );

  const { mutate: deleteSlide, isLoading: isDeleting } = useApiMutation(
    "/api/admin/hero",
    "DELETE",
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Hero slide deleted successfully.",
        });
        refetch();
        setDeleteSlideId(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to delete hero slide: ${error}`,
          variant: "destructive",
        });
      },
    }
  );

  useEffect(() => {
    if (slidesResponse?.data) {
      setSlides(slidesResponse.data);
    }
  }, [slidesResponse]);

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      buttonText: "",
      buttonUrl: "",
      isActive: true,
    });
    setFormErrors({});
    setSelectedSlide(null);
  };

  const validateForm = (): boolean => {
    const errors: Partial<HeroFormData> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (formData.buttonUrl && !isValidUrl(formData.buttonUrl)) {
      errors.buttonUrl = "Please enter a valid URL";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.imageUrl = "Please enter a valid image URL";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const slideData = {
      ...formData,
      subtitle: formData.subtitle || undefined,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      buttonText: formData.buttonText || undefined,
      buttonUrl: formData.buttonUrl || undefined,
    };

    if (selectedSlide) {
      updateSlide({ id: selectedSlide.id, ...slideData });
    } else {
      createSlide(slideData);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      imageUrl: slide.imageUrl || "",
      buttonText: slide.buttonText || "",
      buttonUrl: slide.buttonUrl || "",
      isActive: slide.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteSlideId(id);
  };

  const confirmDelete = () => {
    if (deleteSlideId) {
      deleteSlide(deleteSlideId);
    }
  };

  const toggleSlideStatus = (slide: HeroSlide) => {
    updateSlide({
      id: slide.id,
      isActive: !slide.isActive,
    });
  };

  const handleImageSelect = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({ ...prev, imageUrl: urls[0] }));
    }
  };

  const activeSlides = slides.filter((slide) => slide.isActive);
  const inactiveSlides = slides.filter((slide) => !slide.isActive);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hero Management</h1>
          <p className="text-muted-foreground">
            Manage hero slides for your homepage carousel
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
            <DialogHeader>
              <DialogTitle>Create New Hero Slide</DialogTitle>
              <DialogDescription>
                Add a new slide to your homepage hero carousel
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter slide title"
                    className={formErrors.title ? "border-red-500" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-red-500">{formErrors.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subtitle: e.target.value,
                      }))
                    }
                    placeholder="Enter slide subtitle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter slide description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                    placeholder="Enter image URL or select from media library"
                    className={formErrors.imageUrl ? "border-red-500" : ""}
                  />
                  <AppwriteMediaBrowser
                    onSelect={handleImageSelect}
                    maxSelections={1}
                    buttonText="Browse"
                    triggerClassName="shrink-0"
                  />
                </div>
                {formErrors.imageUrl && (
                  <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
                )}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <AppwriteImg
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        buttonText: e.target.value,
                      }))
                    }
                    placeholder="Enter button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonUrl">Button URL</Label>
                  <Input
                    id="buttonUrl"
                    value={formData.buttonUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        buttonUrl: e.target.value,
                      }))
                    }
                    placeholder="Enter button URL"
                    className={formErrors.buttonUrl ? "border-red-500" : ""}
                  />
                  {formErrors.buttonUrl && (
                    <p className="text-sm text-red-500">
                      {formErrors.buttonUrl}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Slide
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slides</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slides.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Slides</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeSlides.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Slides
            </CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {inactiveSlides.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <Card
            key={slide.id}
            className={`${!slide.isActive ? "opacity-60" : ""}`}
          >
            <div className="relative">
              {slide.imageUrl ? (
                <AppwriteImg
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={slide.isActive ? "default" : "secondary"}>
                  {slide.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{slide.title}</CardTitle>
              {slide.subtitle && (
                <CardDescription>{slide.subtitle}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {slide.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {slide.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(slide)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSlideStatus(slide)}
                  >
                    {slide.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Order: {slide.order}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slides.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hero slides found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first hero slide to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Slide
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <DialogHeader>
            <DialogTitle>Edit Hero Slide</DialogTitle>
            <DialogDescription>
              Update the hero slide information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter slide title"
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Input
                  id="edit-subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subtitle: e.target.value,
                    }))
                  }
                  placeholder="Enter slide subtitle"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter slide description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="Enter image URL or select from media library"
                  className={formErrors.imageUrl ? "border-red-500" : ""}
                />
                <AppwriteMediaBrowser
                  onSelect={handleImageSelect}
                  maxSelections={1}
                  buttonText="Browse"
                  triggerClassName="shrink-0"
                />
              </div>
              {formErrors.imageUrl && (
                <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
              )}
              {formData.imageUrl && (
                <div className="mt-2">
                  <AppwriteImg
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-buttonText">Button Text</Label>
                <Input
                  id="edit-buttonText"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buttonText: e.target.value,
                    }))
                  }
                  placeholder="Enter button text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-buttonUrl">Button URL</Label>
                <Input
                  id="edit-buttonUrl"
                  value={formData.buttonUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buttonUrl: e.target.value,
                    }))
                  }
                  placeholder="Enter button URL"
                  className={formErrors.buttonUrl ? "border-red-500" : ""}
                />
                {formErrors.buttonUrl && (
                  <p className="text-sm text-red-500">{formErrors.buttonUrl}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Slide
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteSlideId}
        onOpenChange={() => setDeleteSlideId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              hero slide.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
