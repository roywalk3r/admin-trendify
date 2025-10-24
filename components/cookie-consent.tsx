"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Cookie, Settings, X } from "lucide-react"
import Link from "next/link"

const STORAGE_KEY = "cookie-consent"
const PREFERENCES_KEY = "cookie-preferences"

type ConsentState = "unknown" | "accepted" | "rejected" | "custom"

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsentBanner() {
  const [state, setState] = useState<ConsentState>("unknown")
  const [showCustomize, setShowCustomize] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    functional: true,
    analytics: true,
    marketing: false,
  })

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ConsentState | null
    if (saved === "accepted" || saved === "rejected" || saved === "custom") {
      setState(saved)
      if (saved === "custom") {
        const savedPrefs = localStorage.getItem(PREFERENCES_KEY)
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs))
        }
      }
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem(STORAGE_KEY, "accepted")
    const allAccepted = { essential: true, functional: true, analytics: true, marketing: true }
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allAccepted))
    setState("accepted")
  }

  const handleRejectAll = () => {
    localStorage.setItem(STORAGE_KEY, "rejected")
    const essentialOnly = { essential: true, functional: false, analytics: false, marketing: false }
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(essentialOnly))
    setState("rejected")
  }

  const handleSavePreferences = () => {
    localStorage.setItem(STORAGE_KEY, "custom")
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    setState("custom")
  }

  if (state !== "unknown") return null

  if (showCustomize) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Cookie className="h-6 w-6" />
              Cookie Preferences
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowCustomize(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            We use cookies to enhance your browsing experience and analyze our traffic. Choose which cookies you want to allow.
          </p>

          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function. Cannot be disabled.
                </p>
              </div>
              <div className="ml-4">
                <input type="checkbox" checked disabled className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Functional Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Enable enhanced functionality like preferences and settings.
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Analytics Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Marketing Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Used to deliver personalized ads and track campaign effectiveness.
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="outline" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button onClick={handleSavePreferences}>
              Save Preferences
            </Button>
            <Button onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-4 inset-x-0 z-50 mx-auto w-[95%] md:max-w-3xl shadow-2xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Cookie className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">We Value Your Privacy</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            We use cookies to personalize content, analyze traffic, and improve your experience. 
            By clicking "Accept All", you consent to our use of cookies. {" "}
            <Link href="/cookie-policy" className="text-primary underline">
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" onClick={() => setShowCustomize(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
          <Button variant="outline" size="sm" onClick={handleRejectAll}>
            Reject All
          </Button>
          <Button size="sm" onClick={handleAcceptAll}>
            Accept All
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function hasConsent() {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEY) === "accepted"
}
