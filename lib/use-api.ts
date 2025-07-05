"use client"

import { useState, useEffect } from "react"

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

  const fetchData = async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(url)

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
    }
  }

  useEffect(() => {
    fetchData()
  }, [url, enabled])

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
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
  options: UseApiOptions = {},
) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

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
    isSuccess,
    reset: () => {
      setData(undefined)
      setError(null)
      setIsSuccess(false)
    },
  }
}
