"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Simple consent check shared with cookie-consent
const CONSENT_KEY = "cookie-consent"

export function Analytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem(CONSENT_KEY)
      setAllowed(v === "accepted")
      const onStorage = (e: StorageEvent) => {
        if (e.key === CONSENT_KEY) setAllowed(e.newValue === "accepted")
      }
      window.addEventListener("storage", onStorage)
      return () => window.removeEventListener("storage", onStorage)
    } catch {
      // ignore
    }
  }, [])

  if (!GA_ID || !allowed) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
