import prisma from "@/lib/prisma";
import { createApiResponse, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

// Hero slide validation schema
const heroSlideSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

const heroSlidesRequestSchema = z.object({
  slides: z.array(heroSlideSchema),
});

export async function GET() {
  try {
    const slides = await prisma.hero.findMany({
      orderBy: { createdAt: "asc" },
    });

    const transformedSlides = slides.map((slide, index) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.description || "",
      description: slide.color || "", // Using color field for additional description
      imageUrl: slide.image || "",
      buttonText: slide.buttonText || "",
      buttonUrl: slide.buttonLink || "",
      isActive: slide.isActive,
      order: index,
      createdAt: slide.createdAt.toISOString(),
      updatedAt: slide.updatedAt.toISOString(),
    }));

    return createApiResponse({
      data: { slides: transformedSlides },
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let slides;
    if (body.slides) {
      // If slides array is provided, use it
      const { slides: parsedSlides } = heroSlidesRequestSchema.parse(body);
      slides = parsedSlides;
    } else {
      // If single slide object is provided, wrap it in an array
      const singleSlide = heroSlideSchema.parse(body);
      slides = [singleSlide];
    }

    // Delete all existing slides and create new ones
    await prisma.hero.deleteMany();

    const createdSlides = await Promise.all(
      slides.map((slide, index) =>
        prisma.hero.create({
          data: {
            title: slide.title,
            description: slide.subtitle || null, // subtitle maps to description
            color: slide.description || null, // description maps to color field
            image: slide.imageUrl || null,
            buttonText: slide.buttonText || null,
            buttonLink: slide.buttonUrl || null,
            isActive: slide.isActive,
          },
        })
      )
    );

    return createApiResponse({
      data: { slides: createdSlides },
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...slideData } = heroSlideSchema.parse(body);

    if (!id) {
      return createApiResponse({
        error: "Slide ID is required",
        status: 400,
      });
    }

    const updatedSlide = await prisma.hero.update({
      where: { id },
      data: {
        title: slideData.title,
        description: slideData.subtitle || null,
        color: slideData.description || null,
        image: slideData.imageUrl || null,
        buttonText: slideData.buttonText || null,
        buttonLink: slideData.buttonUrl || null,
        isActive: slideData.isActive,
      },
    });

    return createApiResponse({
      data: updatedSlide,
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return createApiResponse({
        error: "Slide ID is required",
        status: 400,
      });
    }

    await prisma.hero.delete({
      where: { id },
    });

    return createApiResponse({
      data: { message: "Slide deleted successfully" },
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
