import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ success: true; data: T } | { success: false; error: string; response: NextResponse }> => {
    try {
      let body: any
      
      // Handle different content types
      const contentType = request.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        body = await request.json()
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData()
        body = Object.fromEntries(formData.entries())
      } else {
        return {
          success: false,
          error: 'Unsupported content type',
          response: NextResponse.json(
            { error: 'Unsupported content type. Use JSON or form data.' },
            { status: 415 }
          )
        }
      }

      const result = schema.safeParse(body)
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return {
          success: false,
          error: 'Validation failed',
          response: NextResponse.json(
            { 
              error: 'Validation failed',
              details: errors,
              message: 'Please check your input and try again'
            },
            { status: 400 }
          )
        }
      }

      return { success: true, data: result.data }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid request body',
        response: NextResponse.json(
          { error: 'Invalid request body', message: 'Could not parse request data' },
          { status: 400 }
        )
      }
    }
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams) {
  const params: Record<string, any> = {}
  
  searchParams.forEach((value, key) => {
    // Handle arrays (e.g., ?tags=a&tags=b)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value)
      } else {
        params[key] = [params[key], value]
      }
    } else {
      // Try to parse as number if it looks like one
      if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10)
      } else if (/^\d*\.\d+$/.test(value)) {
        params[key] = parseFloat(value)
      } else if (value === 'true' || value === 'false') {
        params[key] = value === 'true'
      } else {
        params[key] = value
      }
    }
  })

  const result = schema.safeParse(params)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
    
    throw new Error(`Query validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`)
  }

  return result.data
}

export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest) => {
    const validation = await validateRequest(schema)(request)
    
    if (!validation.success) {
      return validation.response
    }
    
    // Add validated data to request headers for downstream handlers
    const requestClone = new Request(request.url, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'x-validated-data': JSON.stringify(validation.data)
      },
      body: JSON.stringify(validation.data)
    })
    
    return requestClone
  }
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Rate limiting validation helper
export function validateRateLimit(headers: Headers): { isValid: boolean; remaining?: number; reset?: number } {
  const limit = headers.get('x-ratelimit-limit')
  const remaining = headers.get('x-ratelimit-remaining')
  const reset = headers.get('x-ratelimit-reset')

  if (!limit || !remaining) {
    return { isValid: true }
  }

  const remainingNum = parseInt(remaining, 10)
  const resetNum = reset ? new Date(reset).getTime() : undefined

  return {
    isValid: remainingNum > 0,
    remaining: remainingNum,
    reset: resetNum
  }
}

// File validation
export function validateFile(file: File, options: {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    }
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (allowedExtensions.length > 0 && extension && !allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension .${extension} is not allowed`
    }
  }

  return { isValid: true }
}

// Common validation configurations
export const FILE_VALIDATION = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif']
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['pdf', 'doc', 'docx']
  },
  CSV: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
    allowedExtensions: ['csv']
  }
}
