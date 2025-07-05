import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { z } from "zod"

// Hero validation schema
const heroSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
    color: z.string().optional(),
    isActive: z.boolean().default(true),
})

export async function GET() {
    try {
        const hero = await prisma.hero.findMany()
        return createApiResponse({ data: hero, status: 200 })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validatedData = heroSchema.parse(body)

        const hero = await prisma.hero.create({
            data: validatedData,
        })

        return createApiResponse({ data: hero, status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, ...validatedData } = heroSchema.parse(body)

        if (!id) {
            return createApiResponse({ error: "Hero ID is required", status: 400 })
        }

        const hero = await prisma.hero.update({
            where: { id },
            data: validatedData,
        })

        return createApiResponse({ data: hero, status: 200 })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url)
        const id = url.searchParams.get("id")

        if (!id) {
            return createApiResponse({ error: "Hero ID is required", status: 400 })
        }

        await prisma.hero.delete({
            where: { id },
        })

        return createApiResponse({  status: 200 })
    } catch (error) {
        return handleApiError(error)
    }
}
