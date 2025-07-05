import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { createApiResponse, handleApiError } from "@/lib/api-utils"
import { adminAuthMiddleware } from "@/lib/admin-auth"
import { seoSchema, generalSchema, socialSchema, emailSchema, themeSchema, defaultSettings } from "./schema"

// Helper function to safely parse JSON
function safeJsonParse(value: any) {
  if (!value) return null

  try {
    return typeof value === "string" ? JSON.parse(value) : value
  } catch (e) {
    console.error("Error parsing JSON:", e)
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const authResponse = await adminAuthMiddleware(req)
    if (authResponse.status !== 200) {
      return authResponse
    }

    console.log("Fetching settings from database...")

    // Start with default settings
    const formattedSettings = {
      seo: { ...defaultSettings.seo },
      general: { ...defaultSettings.general },
      social: { ...defaultSettings.social },
      email: { ...defaultSettings.email },
      theme: { ...defaultSettings.theme },
    }

    try {
      // Get settings from database
      const settings = await prisma.settings.findMany()
      console.log(`Found ${settings.length} settings records`)

      // Only try to parse settings if they exist
      if (settings && settings.length > 0) {
        for (const setting of settings) {
          try {
            if (
              setting.key &&
              (setting.key === "seo" ||
                setting.key === "general" ||
                setting.key === "social" ||
                setting.key === "email" ||
                setting.key === "theme")
            ) {
              // Ensure value is properly parsed
              const parsedValue = safeJsonParse(setting.value)
              if (parsedValue) {
                formattedSettings[setting.key] = parsedValue
                console.log(`Successfully loaded ${setting.key} settings`)
              }
            }
          } catch (e) {
            console.error(`Error processing setting ${setting.key}:`, e)
            // Continue with other settings even if one fails
          }
        }
      } else {
        console.log("No settings found in database, using defaults")
      }
    } catch (dbError) {
      console.error("Database error when fetching settings:", dbError)
      // Continue with default settings if database query fails
    }

    return createApiResponse({
      data: formattedSettings,
      status: 200,
    })
  } catch (error) {
    console.error("Unhandled error in settings GET route:", error)
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const authResponse = await adminAuthMiddleware(req)
    if (authResponse.status !== 200) {
      return authResponse
    }

    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return createApiResponse({
        error: "Invalid JSON in request body",
        status: 400,
      })
    }

    const { type, data } = body

    console.log(`Updating settings for type: ${type}`)

    if (!type || !data) {
      console.error("Missing required fields:", { type, data })
      return createApiResponse({
        error: "Type and data are required",
        status: 400,
      })
    }

    // Validate data based on type
    let validatedData
    try {
      switch (type) {
        case "seo":
          validatedData = seoSchema.parse(data)
          break
        case "general":
          validatedData = generalSchema.parse(data)
          break
        case "social":
          validatedData = socialSchema.parse(data)
          break
        case "email":
          validatedData = emailSchema.parse(data)
          break
        case "theme":
          validatedData = themeSchema.parse(data)
          break
        default:
          console.error(`Invalid settings type: ${type}`)
          return createApiResponse({
            error: "Invalid settings type",
            status: 400,
          })
      }
    } catch (validationError: any) {
      console.error(`Validation error for ${type} settings:`, validationError)
      return createApiResponse({
        error: `Validation error: ${validationError.message || JSON.stringify(validationError)}`,
        status: 400,
      })
    }

    try {
      // Upsert settings
      const key = type
      const settings = await prisma.settings.upsert({
        where: { key },
        update: { value: validatedData },
        create: { key, value: validatedData },
      })

      console.log(`Successfully updated ${key} settings`)

      return createApiResponse({
        data: settings,
        status: 200,
      })
    } catch (dbError: any) {
      console.error(`Database error when updating ${type} settings:`, dbError)
      return createApiResponse({
        error: `Database error: ${dbError.message || JSON.stringify(dbError)}`,
        status: 500,
      })
    }
  } catch (error) {
    console.error("Unhandled error in settings POST route:", error)
    return handleApiError(error)
  }
}
