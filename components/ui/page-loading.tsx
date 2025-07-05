"use client"

import { Loader2 } from "lucide-react"

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
