"use client"

import React, { useEffect, useMemo } from "react"

/**
 * Persists /admin/audit filter query in localStorage and exposes a small
 * "Restore filters" button to navigate back to the last-used filter set.
 */
export default function AuditFilterState() {
  const key = "admin_audit_filters"

  const search = typeof window !== "undefined" ? window.location.search : ""
  const hasQuery = useMemo(() => (search && search.length > 1), [search])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      // Save current query string as the latest state
      localStorage.setItem(key, search)
    } catch {}
  }, [search])

  const onRestore = () => {
    if (typeof window === "undefined") return
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const href = `/admin/audit${saved}`
        window.location.href = href
      }
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={onRestore}
      className="h-9 px-3 rounded-md border text-sm hover:bg-accent"
      title="Restore last used filters"
    >
      Restore filters
    </button>
  )
}
