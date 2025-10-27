const isDev = process.env.NODE_ENV === 'development'

// Simple logger interface to avoid worker thread issues in development
interface Logger {
  error: (data: any, message: string) => void
  info: (data: any, message: string) => void
  warn: (data: any, message: string) => void
  debug: (data: any, message: string) => void
}

// Redact sensitive fields from data
const redactSensitive = (data: any): any => {
  if (!data || typeof data !== 'object') return data
  
  const redacted = { ...data }
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie']
  
  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      redacted[key] = '[REDACTED]'
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitive(redacted[key])
    }
  }
  
  return redacted
}

// Console-based logger for development (no worker threads)
const createConsoleLogger = (): Logger => ({
  error: (data: any, message: string) => {
    try {
      console.error(`[ERROR] ${message}`, redactSensitive(data))
    } catch (e) {
      console.error(`[ERROR] ${message}`, { error: 'Failed to log data' })
    }
  },
  info: (data: any, message: string) => {
    try {
      console.log(`[INFO] ${message}`, redactSensitive(data))
    } catch (e) {
      console.log(`[INFO] ${message}`)
    }
  },
  warn: (data: any, message: string) => {
    try {
      console.warn(`[WARN] ${message}`, redactSensitive(data))
    } catch (e) {
      console.warn(`[WARN] ${message}`)
    }
  },
  debug: (data: any, message: string) => {
    try {
      if (process.env.LOG_LEVEL === 'debug') {
        console.debug(`[DEBUG] ${message}`, redactSensitive(data))
      }
    } catch (e) {
      console.debug(`[DEBUG] ${message}`)
    }
  },
})

// Pino logger for production
const createPinoLogger = (): Logger => {
  try {
    const pino = require('pino')
    
    const pinoInstance = pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'password',
          'email',
          'token',
          'apiKey',
          'secret',
          '*.password',
          '*.token',
          '*.apiKey',
          '*.secret',
        ],
        remove: true,
      },
    })

    return {
      error: (data: any, message: string) => {
        try {
          pinoInstance.error(data, message)
        } catch {
          console.error(`[ERROR] ${message}`, data)
        }
      },
      info: (data: any, message: string) => {
        try {
          pinoInstance.info(data, message)
        } catch {
          console.log(`[INFO] ${message}`, data)
        }
      },
      warn: (data: any, message: string) => {
        try {
          pinoInstance.warn(data, message)
        } catch {
          console.warn(`[WARN] ${message}`, data)
        }
      },
      debug: (data: any, message: string) => {
        try {
          pinoInstance.debug(data, message)
        } catch {
          console.debug(`[DEBUG] ${message}`, data)
        }
      },
    }
  } catch (e) {
    // Fallback to console logger if Pino fails to load
    console.warn('[WARN] Pino not available, using console logger')
    return createConsoleLogger()
  }
}

// Use console logger in development, Pino in production
export const logger: Logger = isDev ? createConsoleLogger() : createPinoLogger()

// Helper functions for common use cases
export const logError = (error: unknown, context?: Record<string, any>) => {
  try {
    // Ensure Error objects are serialized with useful fields
    let serialized: any = error
    if (error instanceof Error) {
      serialized = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any).code ? { code: (error as any).code } : {},
        ...(error as any).meta ? { meta: (error as any).meta } : {},
      }
    } else if (typeof error === 'object' && error !== null) {
      const maybeErr = error as any
      serialized = {
        ...maybeErr,
        message: maybeErr.message ?? undefined,
        code: maybeErr.code ?? undefined,
        meta: maybeErr.meta ?? undefined,
      }
    }

    logger.error({ err: serialized, ...context }, 'Error occurred')
  } catch (fallbackError) {
    console.error('[ERROR] Logging failed:', error)
  }
}

export const logInfo = (message: string, data?: Record<string, any>) => {
  try {
    logger.info(data || {}, message)
  } catch (fallbackError) {
    console.log(`[INFO] ${message}`)
  }
}

export const logWarn = (message: string, data?: Record<string, any>) => {
  try {
    logger.warn(data || {}, message)
  } catch (fallbackError) {
    console.warn(`[WARN] ${message}`)
  }
}

export const logDebug = (message: string, data?: Record<string, any>) => {
  try {
    logger.debug(data || {}, message)
  } catch (fallbackError) {
    console.debug(`[DEBUG] ${message}`)
  }
}

// Request logger
export const logRequest = (
  method: string,
  url: string,
  duration?: number,
  status?: number
) => {
  try {
    logger.info(
      {
        method,
        url,
        duration,
        status,
      },
      'HTTP Request'
    )
  } catch (fallbackError) {
    console.log(`[INFO] ${method} ${url} ${status} ${duration}ms`)
  }
}
