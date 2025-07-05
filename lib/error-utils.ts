import { toast } from "sonner"

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export function handleApiError(error: unknown): ApiError {
  console.error("API Error:", error)

  // Already formatted error
  if (typeof error === "object" && error !== null && "message" in error) {
    return error as ApiError
  }

  // Error from Response object
  if (error instanceof Response) {
    return {
      message: `HTTP Error: ${error.status} ${error.statusText}`,
      status: error.status,
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    }
  }

  // Unknown error format
  return {
    message: String(error),
  }
}

export function showErrorToast(error: unknown, title = "Error") {
  const formattedError = handleApiError(error)
  toast.error(title, {
    description: formattedError.message,
  })
  return formattedError
}

export function logErrorWithContext(error: unknown, context: string) {
  const formattedError = handleApiError(error)
  console.error(`Error in ${context}:`, formattedError)
  return formattedError
}

export function createErrorHandler(context: string) {
  return (error: unknown) => {
    const formattedError = logErrorWithContext(error, context)
    showErrorToast(formattedError)
    return formattedError
  }
}
