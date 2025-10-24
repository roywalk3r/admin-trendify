import { useState, useMemo } from "react"

interface PaginationOptions {
  initialPage?: number
  initialLimit?: number
}

interface PaginationResult {
  page: number
  limit: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  nextPage: () => void
  prevPage: () => void
  reset: () => void
  canGoNext: boolean
  canGoPrev: boolean
}

/**
 * Reusable pagination hook for admin tables
 */
export function usePagination(
  totalItems: number,
  options: PaginationOptions = {}
): PaginationResult {
  const { initialPage = 1, initialLimit = 20 } = options
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit])

  const canGoNext = page < totalPages
  const canGoPrev = page > 1

  const nextPage = () => {
    if (canGoNext) setPage((p) => p + 1)
  }

  const prevPage = () => {
    if (canGoPrev) setPage((p) => p - 1)
  }

  const reset = () => {
    setPage(initialPage)
    setLimit(initialLimit)
  }

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    reset,
    canGoNext,
    canGoPrev,
  }
}
