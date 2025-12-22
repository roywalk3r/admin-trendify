"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AppwriteMediaBrowser } from "@/components/appwrite/appwrite-media-browser"
import { AppwriteImage } from "@/components/appwrite/appwrite-image"
import { ImageIcon, Hash, FolderTree, Info, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  image: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  isActive: boolean
}

interface CategoryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  category?: Category
  categories: Category[]
  onSubmit: (data: CategoryFormValues) => void
  isLoading: boolean
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

export function CategoryFormModal({
  open,
  onOpenChange,
  mode,
  category,
  categories,
  onSubmit,
  isLoading,
}: CategoryFormModalProps) {
  const [showSlugPreview, setShowSlugPreview] = useState(false)

  const defaultValues: CategoryFormValues = {
    id: "",
    name: "",
    slug: "",
    image: "",
    description: "",
    parentId: null,
    isActive: true,
  }

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  })

  // Set form values when editing - use useEffect to avoid running on every render
  useEffect(() => {
    if (mode === "edit" && category && open) {
      form.reset({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image || "",
        description: category.description || "",
        parentId: category.parentId,
        isActive: category.isActive,
      })
    } else if (mode === "create" && open) {
      form.reset(defaultValues)
    }
  }, [category, mode, open, form])

  // Watch name field and auto-generate slug
  const watchedName = form.watch("name")
  const watchedSlug = form.watch("slug")

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    form.setValue("name", name)
    const currentSlug = form.getValues("slug")
    const newSlug = generateSlug(name)
    
    // Only auto-generate if slug is empty or matches auto-generated pattern
    if (!currentSlug || currentSlug === generateSlug(form.getValues("name").substring(0, -1))) {
      form.setValue("slug", newSlug)
    }
  }

  const getAvailableParents = () => {
    if (mode !== "edit") return categories
    const editingId = form.getValues("id")
    if (!editingId) return categories

    // Filter out the current category and its descendants
    return categories.filter((cat) => {
      if (cat.id === editingId) return false
      if (cat.parentId === editingId) return false
      return true
    })
  }

  const handleImageSelect = (urls: string[]) => {
    if (urls.length > 0) {
      form.setValue("image", urls[0])
    }
  }

  const handleFormSubmit = (data: CategoryFormValues) => {
    const submitData = {
      ...data,
      image: data.image || undefined,
      description: data.description || undefined,
      parentId: data.parentId && data.parentId !== "" ? data.parentId : null,
    }
    onSubmit(submitData)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              {mode === "create" ? "Create New Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {mode === "create"
                ? "Fill in the details below to create a new category for your store."
                : "Update the category information. Changes will be reflected immediately."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <Card className="shadow-sm">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Category Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Electronics, Clothing" 
                              className="h-11"
                              {...field} 
                              onChange={(e) => handleNameChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            URL Slug *
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 hover:bg-muted"
                              onClick={() => setShowSlugPreview(!showSlugPreview)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="category-url-slug"
                              className="h-11 font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          {showSlugPreview && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>Preview:</span>
                              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                /categories/{watchedSlug}
                              </code>
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of this category (optional)"
                              className="resize-none min-h-[100px]"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hierarchy Section */}
              <Card className="shadow-sm">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                    Hierarchy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="parentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Parent Category</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select parent category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex items-center gap-2">
                                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                                  No Parent (Top Level)
                                </div>
                              </SelectItem>
                              {getAvailableParents().map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    {cat.parentId && <span className="text-muted-foreground">└─</span>}
                                    {cat.name}
                                    {cat.isActive && (
                                      <Badge variant="secondary" className="text-xs">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Active Status</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Inactive categories won't be shown in the store
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Section */}
              <Card className="shadow-sm">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <ImageIcon className="h-4 w-4 text-primary" />
                    </div>
                    Category Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {form.watch("image") ? (
                      <div className="relative group">
                        <div className="border-2 rounded-lg overflow-hidden bg-muted/30 transition-all hover:border-primary/50">
                          <AppwriteImage
                            src={form.watch("image") || ""}
                            alt="Category preview"
                            width={800}
                            height={400}
                            className="w-full h-56 object-cover"
                          />
                        </div>
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="bg-background/90 backdrop-blur-sm"
                            onClick={() => {
                              window.open(form.watch("image"), '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="bg-background/90 backdrop-blur-sm hover:bg-destructive"
                            onClick={() => form.setValue("image", "")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {form.watch("image")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AppwriteMediaBrowser
                          onSelect={handleImageSelect}
                          maxSelections={1}
                          buttonText="Upload Image"
                          triggerClassName="w-full h-36 border-2 border-dashed rounded-lg hover:border-primary hover:bg-muted/50 flex items-center justify-center transition-colors"
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          SVG, PNG, JPG or GIF (max. 2MB)
                        </p>
                      </div>
                    )}
                    {form.watch("image") && (
                      <AppwriteMediaBrowser
                        onSelect={handleImageSelect}
                        maxSelections={1}
                        buttonText="Change Image"
                        triggerClassName="w-full"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? mode === "create" ? "Creating..." : "Updating..."
                    : mode === "create"
                    ? "Create Category"
                    : "Update Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
