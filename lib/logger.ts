import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Redact sensitive data
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

// Helper functions for common use cases
export const logError = (error: unknown, context?: Record<string, any>) => {
  logger.error({ err: error, ...context }, 'Error occurred')
}

export const logInfo = (message: string, data?: Record<string, any>) => {
  logger.info(data, message)
}

export const logWarn = (message: string, data?: Record<string, any>) => {
  logger.warn(data, message)
}

export const logDebug = (message: string, data?: Record<string, any>) => {
  logger.debug(data, message)
}

// Request logger
export const logRequest = (
  method: string,
  url: string,
  duration?: number,
  status?: number
) => {
  logger.info(
    {
      method,
      url,
      duration,
      status,
    },
    'HTTP Request'
  )
}
