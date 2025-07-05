import prisma from "@/lib/prisma"
import { defaultSettings } from "@/app/api/admin/settings/schema"
import type { Settings } from "@/app/api/admin/settings/schema"

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

/**
 * Get all settings from the database
 */
export async function getSettings(): Promise<Settings> {
  try {
    // Start with default settings
    const formattedSettings: Settings = JSON.parse(JSON.stringify(defaultSettings))

    try {
      // Get settings from database
      const settings = await prisma.settings.findMany()

      // Override with database settings
      if (settings && settings.length > 0) {
        for (const setting of settings) {
          try {
            const type = setting.key as keyof Settings
            if (type in formattedSettings) {
              const parsedValue = safeJsonParse(setting.value)
              if (parsedValue) {
                formattedSettings[type] = parsedValue as any
              }
            }
          } catch (e) {
            console.error(`Error parsing setting ${setting.key}:`, e)
            // Continue with other settings
          }
        }
      }
    } catch (dbError) {
      console.error("Database error when fetching settings:", dbError)
      // Continue with default settings
    }

    return formattedSettings
  } catch (error) {
    console.error("Error in getSettings:", error)
    return JSON.parse(JSON.stringify(defaultSettings))
  }
}

/**
 * Get a specific settings group
 */
export async function getSettingsByType<T extends keyof Settings>(type: T): Promise<Settings[T]> {
  try {
    // Start with default settings for this type
    const defaultForType = JSON.parse(JSON.stringify(defaultSettings[type]))

    try {
      // Get setting from database
      const setting = await prisma.settings.findUnique({
        where: { key: type },
      })

      // Return setting value or default
      if (setting) {
        const parsedValue = safeJsonParse(setting.value)
        if (parsedValue) {
          return parsedValue as Settings[T]
        }
      }
    } catch (dbError) {
      console.error(`Database error when fetching ${type} settings:`, dbError)
      // Continue with default settings
    }

    return defaultForType
  } catch (error) {
    console.error(`Error in getSettingsByType for ${type}:`, error)
    return JSON.parse(JSON.stringify(defaultSettings[type]))
  }
}

/**
 * Update a specific settings group
 */
export async function updateSettings<T extends keyof Settings>(type: T, data: Settings[T]): Promise<boolean> {
  try {
    // Upsert setting
    const key = type
    await prisma.settings.upsert({
      where: { key },
      update: { value: data as any },
      create: { key, value: data as any },
    })

    return true
  } catch (error) {
    console.error(`Error updating ${type} settings:`, error)
    return false
  }
}
