import prisma from "@/lib/prisma";
import { createApiResponse, handleApiError } from "@/lib/api-utils";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getCategoriesCached, invalidateCategoriesLists, invalidateCategory } from "@/lib/data/categories";
import { revalidateTag } from "next/cache";

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
  image: z.string().url("Invalid image URL").optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

// Query params validation schema
const queriesSchema = z.object({
  withProducts: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeChildren: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  parentId: z.string().optional(),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => Number.parseInt(val || "1")),
  limit: z
    .string()
    .optional()
    .transform((val) => Number.parseInt(val || "20")),
  sortBy: z
    .enum(["name", "createdAt", "updatedAt", "productCount"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Parse and validate query parameters
    const {
      withProducts,
      includeChildren,
      parentId,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      includeDeleted,
    } = queriesSchema.parse(Object.fromEntries(url.searchParams));

    // Use cached helper for categories list
    const response = await getCategoriesCached({
      withProducts,
      includeChildren,
      parentId,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      includeDeleted,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Categories API Error:", error);
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    // Check if user is authenticated and is an admin
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    // If parentId is provided, verify it exists
    if (validatedData.parentId !== null) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return createApiResponse({
          error: "Parent category not found",
          status: 404,
        });
      }
    }

    // Check if category with same name or slug already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug: validatedData.slug }],
        deletedAt: null,
      },
    });

    if (existingCategory) {
      return createApiResponse({
        error: "A category with this name or slug already exists",
        status: 409,
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Invalidate category lists and revalidate tags
    try {
      await invalidateCategoriesLists();
      revalidateTag("categories");
    } catch {}

    return createApiResponse({
      data: category,
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const { id, ...validatedData } = categorySchema.parse(body);

    if (!id) {
      return createApiResponse({
        error: "Category ID is required",
        status: 400,
      });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return createApiResponse({
        error: "Category not found",
        status: 404,
      });
    }

    // If parentId is being changed, check for circular references
    if (
      validatedData.parentId !== null &&
      validatedData.parentId !== existingCategory.parentId
    ) {
      // Cannot set parent to self
      if (validatedData.parentId === id) {
        return createApiResponse({
          error: "A category cannot be its own parent",
          status: 400,
        });
      }

      // Check if the new parent exists
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return createApiResponse({
          error: "Parent category not found",
          status: 404,
        });
      }

      // Check for circular reference in category hierarchy
      let currentParent = validatedData.parentId;
      while (currentParent) {
        if (currentParent === id) {
          return createApiResponse({
            error: "Circular reference detected in category hierarchy",
            status: 400,
          });
        }

        const parent: any = await prisma.category.findUnique({
          where: { id: currentParent },
          select: { parentId: true },
        });

        if (!parent) break;
        currentParent = parent.parentId;
      }
    }

    // Check if slug or name conflicts with another category
    const conflictingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug: validatedData.slug }],
        NOT: { id },
        deletedAt: null,
      },
    });

    if (conflictingCategory) {
      return createApiResponse({
        error: "A different category with this name or slug already exists",
        status: 409,
      });
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Invalidate caches and revalidate tags
    try {
      await invalidateCategoriesLists();
      await invalidateCategory(id);
      revalidateTag("categories");
      revalidateTag(`category:${id}`);
    } catch {}

    return createApiResponse({
      data: updatedCategory,
      status: 200,
    });
  } catch (error) {
    console.error("Categories API Error:", error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const force = url.searchParams.get("force") === "true";

    if (!id) {
      return createApiResponse({
        error: "Category ID is required",
        status: 400,
      });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return createApiResponse({
        error: "Category not found",
        status: 404,
      });
    }

    // Check if category has products or child categories
    if (
      !force &&
      (existingCategory._count.products > 0 ||
        existingCategory._count.children > 0)
    ) {
      return createApiResponse({
        error:
          "Cannot delete category with associated products or subcategories",
        status: 409,
      });
    }

    if (force) {
      // Hard delete
      await prisma.category.delete({
        where: { id },
      });
    } else {
      // Soft delete
      await prisma.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    // Invalidate caches and revalidate tags
    try {
      await invalidateCategoriesLists();
      await invalidateCategory(id);
      revalidateTag("categories");
      revalidateTag(`category:${id}`);
    } catch {}

    return createApiResponse({
      data: { message: "Category deleted successfully", force },
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
