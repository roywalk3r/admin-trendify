"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppwriteUpload } from "@/components/appwrite/appwrite-upload"
import { AppwriteMediaBrowser } from "@/components/appwrite/appwrite-media-browser"
import { AppwriteImage } from "@/components/appwrite/appwrite-image"
import type { Product, Category } from "@/types/product"

// Product validation schema
const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Partial<Product>
  isEditing?: boolean
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [formStatus, setFormStatus] = useState<string>("")

  // Debug logging for initialData
  useEffect(() => {
    console.log("ProductForm initialData:", initialData)
    console.log("isEditing:", isEditing)
  }, [initialData, isEditing])

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFormStatus("Fetching categories...")
        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()
        setCategories(data.data || [])
        setFormStatus("Categories loaded")
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories")
        setFormStatus("Failed to load categories")
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      name: initialData?.name || "",
      description: initialData?.description || "",
      // Ensure these are properly converted to numbers
      price: initialData?.price ? Number(initialData.price) : 0,
      stock: initialData?.stock ? Number(initialData.stock) : 0,
      categoryId: initialData?.categoryId || "",
      images: initialData?.images || [],
    },
    mode: "onChange", // Validate on change for better UX
  })

  // Debug logging for form values
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values changed:", value)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Handle image upload success
  const handleUploadSuccess = (urls: string[]) => {
    console.log("Uploaded image URLs:", urls)
    const updatedImages = [...imageUrls, ...urls]
    setImageUrls(updatedImages)
    form.setValue("images", updatedImages, { shouldValidate: true })

    toast.success(`${urls.length} image(s) uploaded successfully.`)
  }

  // Handle media library selection
  const handleMediaSelection = (selectedUrls: string[]) => {
    console.log("Selected media URLs:", selectedUrls)
    const updatedImages = [...imageUrls, ...selectedUrls]
    setImageUrls(updatedImages)
    form.setValue("images", updatedImages, { shouldValidate: true })
  }

  // Remove image from the list
  const handleRemoveImage = (index: number) => {
    console.log("Removing image at index:", index)
    const updatedImages = imageUrls.filter((_, i) => i !== index)
    setImageUrls(updatedImages)
    form.setValue("images", updatedImages, { shouldValidate: true })
  }

  // Form submission
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true)
      setFormStatus("Submitting form...")
      console.log("Form submitted. Data:", data)
      console.log("Form validation state:", form.formState)

      // Make sure we're using the correct ID for updates
      const productId = isEditing ? initialData?.id : data.id

      if (isEditing && !productId) {
        const errorMessage = "Product ID is missing for update operation"
        console.error(errorMessage)
        toast.error(errorMessage)
        setFormStatus("Error: Missing product ID")
        return
      }

      const endpoint = isEditing ? `/api/admin/products/${productId}` : "/api/admin/products"
      const method = isEditing ? "PATCH" : "POST"

      // Include the ID in the request body for clarity
      const requestData = {
        ...data,
        id: productId,
      }

      console.log(`Sending ${method} request to ${endpoint}:`, requestData)
      setFormStatus(`Sending ${method} request...`)

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        // Prevent caching issues
        cache: "no-store",
      })

      console.log("Response status:", response.status)
      setFormStatus(`Got response: ${response.status}`)

      let responseText
      let responseData

      try {
        // First get the raw text to debug any parsing issues
        responseText = await response.text()
        console.log("Raw response:", responseText)

        // Try to parse as JSON if possible
        try {
          responseData = JSON.parse(responseText)
          console.log("Parsed response data:", responseData)
        } catch (e) {
          console.log("Response is not valid JSON")
        }
      } catch (e) {
        console.error("Error reading response:", e)
      }

      if (!response.ok) {
        // Extract error message
        let errorMessage = "Failed to save product"
        if (responseData && (responseData.error || responseData.message)) {
          errorMessage = responseData.error || responseData.message
        } else {
          errorMessage = `Error: ${response.status} ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      setFormStatus("Success!")
      toast.success(isEditing ? "Product updated successfully" : "Product created successfully")

      // Add a small delay before navigation to ensure the toast is visible
      setTimeout(() => {
        console.log("Navigating back to products list")
        router.push("/admin/products")
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Error saving product:", error)
      setFormStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast.error(error instanceof Error ? error.message : "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler for manual form submission (bypass react-hook-form)
  const handleManualSubmit = async () => {
    // Check if the form is valid
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error("Please correct the form errors before submitting")
      return
    }

    // Get current values
    const formValues = form.getValues()
    console.log("Manual submit with values:", formValues)

    // Call the regular submit handler
    await onSubmit(formValues)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Product" : "Create New Product"}</h1>
        {formStatus && (
          <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">Status: {formStatus}</div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Enter the basic details of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && (
                  <div className="text-sm bg-muted p-2 rounded mb-4">Editing product ID: {initialData?.id}</div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter product description" className="min-h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === "" ? "" : Number(value))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === "" ? "" : Number.parseInt(value, 10))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoadingCategories}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCategories ? (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            ) : categories.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No categories found
                              </SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Add images for your product using Appwrite Storage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormDescription>Upload or select images from your media library.</FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <AppwriteUpload
                              onUploadSuccess={handleUploadSuccess}
                              buttonText="Upload Images"
                              multiple={true}
                              acceptedFileTypes="image/*"
                            />

                            <AppwriteMediaBrowser
                              onSelect={handleMediaSelection}
                              buttonText="Media Library"
                              maxSelections={10}
                              allowDelete={true}
                            />
                          </div>

                          {imageUrls.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {imageUrls.map((url, index) => (
                                <div
                                  key={`img-${index}-${url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("/") + 8)}`}
                                  className="relative group"
                                >
                                  <div className="aspect-square overflow-hidden rounded-md border">
                                    <AppwriteImage
                                      src={url}
                                      width={200}
                                      height={200}
                                      alt={`Product image ${index + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRemoveImage(index)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border rounded-md p-8 text-center text-muted-foreground">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                              <p>No images added yet</p>
                              <p className="text-sm">Upload or select images from the media library</p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>

            {/* Regular submit button */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>

            {/* Alternative direct submit button for debugging */}
            <Button type="button" onClick={handleManualSubmit} disabled={isSubmitting} variant="secondary">
              Force Submit
            </Button>
          </div>

          {/* Debug form state */}
          <div className="mt-8 p-4 bg-muted rounded-md">
            <details>
              <summary className="cursor-pointer text-sm font-medium">Debug Form Information</summary>
              <div className="mt-2 text-xs">
                <p>Form dirty: {form.formState.isDirty ? "Yes" : "No"}</p>
                <p>Form valid: {form.formState.isValid ? "Yes" : "No"}</p>
                <p>
                  Form errors:{" "}
                  {Object.keys(form.formState.errors).length > 0 ? JSON.stringify(form.formState.errors) : "None"}
                </p>
                <p>Is Editing: {isEditing ? "Yes" : "No"}</p>
                <p>Product ID: {initialData?.id || "Not set"}</p>
              </div>
            </details>
          </div>
        </form>
      </Form>
    </div>
  )
}
