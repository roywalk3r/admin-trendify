"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FolderTree,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useApi, useApiMutation } from "@/lib/hooks/use-api";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import { AppwriteImage } from "@/components/appwrite/appwrite-image";
import { Input } from "@/components/ui/input";

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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
        setEditingCategory(null);
      },
      onError: (error) => {
        toast.error(`Error updating category: ${error}`);
      },
    });

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

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditing(true);
  };

  const handleCreateSubmit = (data: any) => {
    createCategory(data);
  };

  const handleEditSubmit = (data: any) => {
    updateCategory(data);
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
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Create Category Modal */}
      <CategoryFormModal
        open={isCreating}
        onOpenChange={setIsCreating}
        mode="create"
        categories={categories}
        onSubmit={handleCreateSubmit}
        isLoading={isCreatingCategory}
      />

      {/* Edit Category Modal */}
      <CategoryFormModal
        open={isEditing}
        onOpenChange={setIsEditing}
        mode="edit"
        category={editingCategory || undefined}
        categories={categories}
        onSubmit={handleEditSubmit}
        isLoading={isUpdatingCategory}
      />

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
                        <DropdownMenuTrigger asChild>
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
