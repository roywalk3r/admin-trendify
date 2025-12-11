import prisma from "@/lib/prisma";
import { createApiResponse, handleApiError } from "@/lib/api-utils";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { deleteCache, getCache, setCache } from "@/lib/redis";

// Category validation schema
const categoryUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .optional(),
  image: z.string().url("Invalid image URL").optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Check cache first
    const cacheKey = `category:${id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Fetch category with related data
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
            stock: true,
          },
          where: { isDeleted: false, deletedAt: null, isActive: true },
          take: 10,
        },
        children: {
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: {
              where: { isDeleted: false, deletedAt: null, isActive: true },
            },
            children: true,
          },
        },
      },
    });

    if (!category) {
      return createApiResponse({
        error: "Category not found",
        status: 404,
      });
    }

    const result = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      _count: category._count,
      products: category.products,
      children: category.children,
      parent: category.parent,
    };

    // Cache result for 5 minutes
    await setCache(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Category GET API Error:", error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      });
    }

    const { id } = params;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = categoryUpdateSchema.parse(body);

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
      validatedData.parentId !== undefined &&
      validatedData.parentId !== existingCategory.parentId
    ) {
      // Cannot set parent to self
      if (validatedData.parentId === id) {
        return createApiResponse({
          error: "A category cannot be its own parent",
          status: 400,
        });
      }

      // Check if the new parent exists (if not null)
      if (validatedData.parentId) {
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
    }

    // Check if slug or name conflicts with another category
    if (validatedData.name || validatedData.slug) {
      const conflictingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            ...(validatedData.name ? [{ name: validatedData.name }] : []),
            ...(validatedData.slug ? [{ slug: validatedData.slug }] : []),
          ],
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

    // Invalidate caches
    await deleteCache("categories:*");
    await deleteCache(`category:${id}`);

    return createApiResponse({
      data: updatedCategory,
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return createApiResponse({
        error: "Unauthorized",
        status: 401,
      });
    }

    const { id } = params;
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

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
          "Cannot delete category with associated products or subcategories. Use force=true to override.",
        status: 409,
      });
    }

    if (force) {
      // Hard delete - also handle child categories and products
      await prisma.$transaction(async (tx) => {
        // Move child categories to parent's parent or make them root categories
        await tx.category.updateMany({
          where: { parentId: id },
          data: { parentId: existingCategory.parentId },
        });

        // Move products to parent category or make them uncategorized
        await tx.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: existingCategory.parentId ?? undefined },
        })
        // Delete the category
        await tx.category.delete({
          where: { id },
        });
      });
    } else {
      // Soft delete
      await prisma.category.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });
    }

    // Invalidate caches
    await deleteCache("categories:*");
    await deleteCache(`category:${id}`);

    return createApiResponse({
      data: { message: "Category deleted successfully", force },
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
