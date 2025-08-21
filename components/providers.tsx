"use client"

import { ClerkProvider } from "@clerk/nextjs"
import type React from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      afterSignOutUrl={"/"}
      appearance={{
        captcha: {
          theme: "auto",
          size: "flexible",
          language: "es-ES",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
