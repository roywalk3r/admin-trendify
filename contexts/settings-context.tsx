"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Settings } from "@/app/api/admin/settings/schema"
import { defaultSettings } from "@/app/api/admin/settings/schema"

interface SettingsContextType {
  settings: Settings
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/settings")
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.data) {
        // Merge with defaults to ensure all fields are present
        const mergedSettings: Settings = {
          seo: { ...defaultSettings.seo, ...data.data.seo },
          general: { ...defaultSettings.general, ...data.data.general },
          social: { ...defaultSettings.social, ...data.data.social },
          email: { ...defaultSettings.email, ...data.data.email },
          theme: { ...defaultSettings.theme, ...data.data.theme },
        }
        setSettings(mergedSettings)
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
      // Keep default settings on error
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
    refetch: fetchSettings,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

export function useSEOSettings() {
  const { settings } = useSettings()
  return settings.seo
}

export function useGeneralSettings() {
  const { settings } = useSettings()
  return settings.general
}

export function useSocialSettings() {
  const { settings } = useSettings()
  return settings.social
}

export function useEmailSettings() {
  const { settings } = useSettings()
  return settings.email
}

export function useThemeSettings() {
  const { settings } = useSettings()
  return settings.theme
}
