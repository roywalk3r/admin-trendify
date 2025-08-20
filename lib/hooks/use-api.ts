"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type ApiResponse<T> = {
  data?: T
  error?: string | string[] | Record<string, string[]>
}

type UseApiOptions = {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  enabled?: boolean
}

export function useApi<T>(url: string, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const { onSuccess, onError, enabled = true } = options

  // Guard against overlapping requests without tying to render state
  const inFlightRef = useRef(false)

  const fetchData = useCallback(async () => {
    // Gate by enabled and avoid overlapping requests
    if (!enabled || inFlightRef.current) return

    setIsLoading(true)
    inFlightRef.current = true
    setError(null)

    try {
      const response = await fetch(url, { cache: "no-store" })

      // Check if response has content before parsing
      const contentType = response.headers.get("content-type")
      let result: ApiResponse<T> = {}

      if (contentType && contentType.includes("application/json") && response.status !== 204) {
        const text = await response.text()
        if (text) {
          result = JSON.parse(text) as ApiResponse<T>
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : Array.isArray(result.error)
              ? result.error.join(", ")
              : `Request failed with status ${response.status}`

        throw new Error(errorMessage)
      }

      if (result.data) {
        setData(result.data)
        setIsSuccess(true)
        onSuccess?.(result.data)
      } else if (response.ok) {
        // Handle successful but empty responses
        setIsSuccess(true)
        onSuccess?.(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      onError?.(errorMessage)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
      inFlightRef.current = false
    }
  }, [enabled, url, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    error,
    isLoading,
    isSuccess,
    refetch: fetchData,
  }
}

export function useApiMutation<T, U = any>(
  url: string,
  methodOrOptions: "POST" | "PUT" | "DELETE" | "PATCH" | UseApiOptions = "POST",
  maybeOptions: UseApiOptions = {},
) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Normalize arguments to support both signatures:
  // useApiMutation(url, options)
  // useApiMutation(url, method, options)
  const method: "POST" | "PUT" | "DELETE" | "PATCH" =
    typeof methodOrOptions === "string" ? methodOrOptions : "POST"
  const options: UseApiOptions =
    typeof methodOrOptions === "object" ? (methodOrOptions as UseApiOptions) : maybeOptions

  const { onSuccess, onError } = options

  const mutate = async (payload?: U) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
      })

      // Check if response has content before parsing
      const contentType = response.headers.get("content-type")
      let result: ApiResponse<T> = {}

      if (contentType && contentType.includes("application/json") && response.status !== 204) {
        const text = await response.text()
        if (text) {
          result = JSON.parse(text) as ApiResponse<T>
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : Array.isArray(result.error)
              ? result.error.join(", ")
              : `Request failed with status ${response.status}`

        throw new Error(errorMessage)
      }

      // Handle both cases: with data and without data
      if (result.data) {
        setData(result.data)
        setIsSuccess(true)
        onSuccess?.(result.data)
        return result.data
      } else {
        // Handle successful but empty responses
        setIsSuccess(true)
        onSuccess?.(null)
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      onError?.(errorMessage)
      setIsSuccess(false)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutate,
    data,
    error,
    isLoading,
    isPending: isLoading,
    isSuccess,
    reset: () => {
      setData(undefined)
      setError(null)
      setIsSuccess(false)
    },
  }
}
