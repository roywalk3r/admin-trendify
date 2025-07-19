"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Search, Edit, Trash2, Tag } from "lucide-react";
import { useApi, useApiMutation } from "@/lib/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppwriteUpload } from "@/components/appwrite/appwrite-upload";
import { AppwriteImage } from "@/components/appwrite/appwrite-image";
import { AppwriteMediaBrowser } from "@/components/appwrite/appwrite-media-browser";
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

// Category validation schema
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
    children: number;
  };
  products: any[];
  children: any[];
}

interface CategoriesResponse {
  data: Category[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function AdminCategoriesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any>([]);

  // Fetch categories
  const {
    data: categoriesResponse,
    isLoading,
    refetch,
  } = useApi<CategoriesResponse>("/api/categories");

  useEffect(() => {
    if (categoriesResponse) {
      setCategories(categoriesResponse.data);
      console.log("Categories response:", categoriesResponse);
      setCategories(categoriesResponse);
    }
  }, [categoriesResponse]);

  // Create category mutation
  const { mutate: createCategory, isLoading: isCreatingCategory } =
    useApiMutation("/api/categories", "POST", {
      onSuccess: () => {
        toast.success("Category created successfully");
        refetch();
        setIsCreating(false);
        createForm.reset();
      },
      onError: (error) => {
        toast.error(`Error creating category: ${error}`);
      },
    });

  // Update category mutation
  const { mutate: updateCategory, isLoading: isUpdatingCategory } =
    useApiMutation("/api/categories", "PATCH", {
      onSuccess: () => {
        toast.success("Category updated successfully");
        refetch();
        setIsEditing(false);
        editForm.reset();
      },
      onError: (error) => {
        toast.error(`Error updating category: ${error}`);
      },
    });

  // Delete category mutation
  const { mutate: deleteCategory, isLoading: isDeletingCategory } =
    useApiMutation(`/api/categories?id=${categoryToDelete?.id}`, "DELETE", {
      onSuccess: () => {
        toast.success("Category deleted successfully");
        refetch();
        setCategoryToDelete(null);
        setDeleteError(null);
      },
      onError: (error) => {
        if (error.includes("associated products")) {
          setDeleteError(
            "This category has associated products. Please reassign or delete these products first."
          );
        } else {
          toast.error(`Error deleting category: ${error}`);
        }
      },
    });

  // Create form
  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      description: "",
    },
  });

  // Edit form
  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: "",
      name: "",
      slug: "",
      image: "",
      description: "",
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: CategoryFormValues) => {
    const submitData = {
      ...data,
      image: data.image || undefined,
      description: data.description || undefined,
    };
    createCategory(submitData);
  };

  // Handle edit form submission
  const onEditSubmit = (data: CategoryFormValues) => {
    const submitData = {
      ...data,
      image: data.image || undefined,
      description: data.description || undefined,
    };
    updateCategory(submitData);
  };

  // Handle image upload
  const handleImageUpload = (urls: string[], form: any) => {
    if (urls.length > 0) {
      form.setValue("image", urls[0]);
    }
  };

  // Handle media browser selection
  const handleMediaSelect = (urls: string[], form: any) => {
    if (urls.length > 0) {
      form.setValue("image", urls[0]);
    }
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    editForm.reset({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      description: category.description || "",
    });
    setIsEditing(true);
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    if (categoryToDelete?.id) {
      deleteCategory(categoryToDelete.id);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("Current categories:", categories);
  console.log("Filtered categories:", filteredCategories);
  console.log("Is loading:", isLoading);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No categories found</h2>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? "Try a different search term"
              : "Add your first category to get started"}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category: Category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                      {category.image ? (
                        <AppwriteImage
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground">
                        {category.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-600 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category._count?.products || 0} products
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCategoryToDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new product category to your store.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Category name"
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-generate slug when name changes
                          if (!createForm.getValues("slug")) {
                            createForm.setValue(
                              "slug",
                              generateSlug(e.target.value)
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="category-slug" />
                    </FormControl>
                    <FormDescription>
                      Used in URLs. Only lowercase letters, numbers, and
                      hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Category description (optional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <AppwriteUpload
                            onUploadSuccess={(urls) =>
                              handleImageUpload(urls, createForm)
                            }
                            buttonText="Upload Image"
                            multiple={false}
                          />
                          <AppwriteMediaBrowser
                            onSelect={(urls) =>
                              handleMediaSelect(urls, createForm)
                            }
                            maxSelections={1}
                            buttonText="Browse Media"
                          />
                        </div>
                        {field.value && (
                          <div className="mt-2">
                            <AppwriteImage
                              src={field.value}
                              alt="Category image"
                              width={200}
                              height={200}
                              className="rounded-md"
                            />
                          </div>
                        )}
                        <Input type="hidden" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingCategory}>
                  {isCreatingCategory ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Category name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="category-slug" />
                    </FormControl>
                    <FormDescription>
                      Used in URLs. Only lowercase letters, numbers, and
                      hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Category description (optional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <AppwriteUpload
                            onUploadSuccess={(urls) =>
                              handleImageUpload(urls, editForm)
                            }
                            buttonText="Upload Image"
                            multiple={false}
                          />
                          <AppwriteMediaBrowser
                            onSelect={(urls) =>
                              handleMediaSelect(urls, editForm)
                            }
                            maxSelections={1}
                            buttonText="Browse Media"
                          />
                        </div>
                        {field.value && (
                          <div className="mt-2">
                            <AppwriteImage
                              src={field.value}
                              alt="Category image"
                              width={200}
                              height={200}
                              className="rounded-md"
                            />
                          </div>
                        )}
                        <Input type="hidden" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input type="hidden" {...editForm.register("id")} />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingCategory}>
                  {isUpdatingCategory ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This
              action cannot be undone.
              {deleteError && (
                <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                  {deleteError}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCategoryToDelete(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isDeletingCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingCategory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
