import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"

export async function GET() {
  try {
    const slides = await prisma.hero.findMany({
      where: {
        isActive: true, // Only return active slides for public API
      },
      orderBy: { createdAt: "asc" },
    })

    // Transform for frontend consumption with clean field names
    const transformedSlides = slides.map((slide, index) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.description || "",
      description: slide.color || "",
      imageUrl: slide.image || "",
      buttonText: slide.buttonText || "Learn More",
      buttonUrl: slide.buttonLink || "#",
      order: index,
    }))

    return createApiResponse({
      data: { slides: transformedSlides },
      status: 200,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
