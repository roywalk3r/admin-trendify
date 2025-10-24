import { useEffect, useState } from "react"

/**
 * Debounce hook for optimizing search inputs and API calls
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
