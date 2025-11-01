"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AppwriteMediaBrowser } from "@/components/appwrite/appwrite-media-browser";
import { AppwriteImage } from "@/components/appwrite/appwrite-image";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FolderTree,
  ImageIcon,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useApi, useApiMutation } from "@/lib/hooks/use-api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    products: number;
    subcategories: number;
  };
}

interface CategoriesResponse {
  data: Category[];
}

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  slug: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [activeForm, setActiveForm] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: categoriesResponse,
    isLoading,
    refetch,
  } = useApi<CategoriesResponse>("/api/categories");

  useEffect(() => {
    if (categoriesResponse) {
      setCategories((categoriesResponse as unknown as Category[]) || []);
    }
  }, [categoriesResponse]);

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

  const { mutate: deleteCategory, isLoading: isDeletingCategory } =
    useApiMutation(`/api/categories/${categoryToDelete?.id}`, "DELETE", {
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

  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      description: "",
      parentId: "",
      isActive: true,
    },
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: "",
      name: "",
      slug: "",
      image: "",
      description: "",
      parentId: "",
      isActive: true,
    },
  });

  const onCreateSubmit = (data: CategoryFormValues) => {
    const slug = generateSlug(data.name);
    const submitData = {
      ...data,
      slug,
      image: data.image || undefined,
      description: data.description || undefined,
      parentId: data.parentId && data.parentId !== "" ? data.parentId : null,
    };
    createCategory(submitData);
  };

  const onEditSubmit = (data: CategoryFormValues) => {
    const slug = generateSlug(data.name);
    const submitData = {
      ...data,
      slug,
      image: data.image || undefined,
      description: data.description || undefined,
      parentId: data.parentId && data.parentId !== "" ? data.parentId : null,
    };
    updateCategory(submitData);
  };

  const handleImageUpload = (urls: string[], form: any) => {
    if (urls.length > 0) {
      form.setValue("image", urls[0]);
    }
  };

  const handleMediaSelect = (urls: string[], form: any) => {
    if (urls.length > 0) {
      form.setValue("image", urls[0]);
    }
    setShowMediaBrowser(false);
  };

  const handleEditCategory = (category: Category) => {
    editForm.reset({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      description: category.description || "",
      parentId: category.parentId || "",
      isActive: category.isActive,
    });
    setIsEditing(true);
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete?.id) {
      deleteCategory(categoryToDelete.id);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvailableParents = () => {
    const editingId = editForm.getValues("id");
    if (!editingId) return categories;

    // Filter out the current category and its descendants to prevent circular references
    const filterDescendants = (
      cats: Category[],
      excludeId: string
    ): Category[] => {
      return cats.filter((cat) => {
        if (cat.id === excludeId) return false;
        if (cat.parentId === excludeId) return false;
        return true;
      });
    };

    return filterDescendants(categories, editingId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            {categories.length} categories total
          </p>
        </div>
        <Dialog
          open={isCreating}
          onOpenChange={(open) => {
            setIsCreating(open);
            if (!open) createForm.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your products.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(onCreateSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              No Parent (Top Level)
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter category description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Category Image</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setActiveForm("create");
                        setShowMediaBrowser(true);
                      }}
                      className="flex-1"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {createForm.watch("image")
                        ? "Change Image"
                        : "Select Image"}
                    </Button>
                    {createForm.watch("image") && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => createForm.setValue("image", "")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {createForm.watch("image") && (
                    <div className="mt-2">
                      <AppwriteImage
                        src={createForm.watch("image") || ""}
                        alt="Category preview"
                        width={200}
                        height={100}
                        className="rounded border object-cover"
                      />
                    </div>
                  )}
                </div>

                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
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
                    disabled={isCreatingCategory}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingCategory}>
                    {isCreatingCategory ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) editForm.reset();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            No Parent (Top Level)
                          </SelectItem>
                          {getAvailableParents().map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter category description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Category Image</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveForm("edit");
                      setShowMediaBrowser(true);
                    }}
                    className="flex-1"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {editForm.watch("image") ? "Change Image" : "Select Image"}
                  </Button>
                  {editForm.watch("image") && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => editForm.setValue("image", "")}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {editForm.watch("image") && (
                  <div className="mt-2">
                    <AppwriteImage
                      src={editForm.watch("image") || ""}
                      alt="Category preview"
                      width={200}
                      height={100}
                      className="rounded border object-cover"
                    />
                  </div>
                )}
              </div>

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdatingCategory}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingCategory}>
                  {isUpdatingCategory ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showMediaBrowser && (
        <Dialog open={showMediaBrowser} onOpenChange={setShowMediaBrowser}>
          <DialogContent className="max-w-2xl h-auto">
            <DialogHeader>
              <DialogTitle>Select Category Image</DialogTitle>
              <AppwriteMediaBrowser
                onSelect={(urls) =>
                  handleMediaSelect(
                    urls,
                    activeForm === "create" ? createForm : editForm
                  )
                }
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Categories
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first category to organize your products.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {category.image ? (
                          <AppwriteImage
                            src={category.image}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <FolderTree className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            /{category.slug}
                          </div>
                          {category.description && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.parent ? (
                        <Badge variant="outline">{category.parent.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Top Level</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {category._count?.products || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {category._count?.subcategories || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(category.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setCategoryToDelete(category);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertDialog
                        open={categoryToDelete?.id === category.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setCategoryToDelete(null);
                            setDeleteError(null);
                          }
                        }}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{category.name}&quot;?
                              This action cannot be undone and will affect all
                              products in this category.
                              {deleteError && (
                                <div className="mt-2 text-sm text-destructive">
                                  {deleteError}
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeleteError(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteCategory}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={isDeletingCategory}
                            >
                              {isDeletingCategory ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
