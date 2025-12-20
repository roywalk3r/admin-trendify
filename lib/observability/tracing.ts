import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { trace, SpanStatusCode, SpanKind } from '@opentelemetry/api'

const serviceName = 'trendify-ecommerce'
const serviceVersion = process.env.npm_package_version || '1.0.0'

// Create resource configuration
const resourceConfig = {
  'service.name': serviceName,
  'service.version': serviceVersion,
  'service.environment': process.env.NODE_ENV || 'development',
  'service.instance.id': process.env.HOSTNAME || 'local',
}

// Initialize tracing only if enabled
export function initializeTracing() {
  if (!process.env.OTEL_ENABLED || process.env.OTEL_ENABLED !== 'true') {
    return null
  }

  const sdk = new NodeSDK({
    // Resource configuration handled by NodeSDK
    instrumentations: [getNodeAutoInstrumentations({
      // Disable some noisy instrumentations
      '@opentelemetry/instrumentation-fs': {
        enabled: false
      }
    })],
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
        headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
          JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {},
      })
    ),
    metricReader: new PrometheusExporter({
      port: parseInt(process.env.PROMETHEUS_PORT || '9464'),
    }),
  })

  try {
    sdk.start()
    console.log('OpenTelemetry tracing initialized successfully')
    return sdk
  } catch (error) {
    console.error('Error initializing OpenTelemetry:', error)
    return null
  }
}

// Tracer instance
const tracer = trace.getTracer(serviceName, serviceVersion)

// Custom span creation utilities
export interface SpanOptions {
  name: string
  kind?: SpanKind
  attributes?: Record<string, string | number | boolean>
  parent?: any
}

export async function createSpan<T>(
  options: SpanOptions,
  fn: (span: any) => Promise<T> | T
): Promise<T> {
  const span = tracer.startSpan(options.name, {
    kind: options.kind || SpanKind.INTERNAL,
    attributes: options.attributes,
  }, undefined)

  try {
    const result = await fn(span)
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  } finally {
    span.end()
  }
}

// Database operation tracing
export async function traceDatabase<T>(
  operation: string,
  table: string,
  fn: () => Promise<T> | T
): Promise<T> {
  return createSpan({
    name: `db.${operation}`,
    kind: SpanKind.CLIENT,
    attributes: {
      'db.system': 'postgresql',
      'db.operation': operation,
      'db.collection.name': table,
    }
  }, fn)
}

// API route tracing
export async function traceApiRoute<T>(
  method: string,
  route: string,
  fn: (span: any) => Promise<T> | T
): Promise<T> {
  return createSpan({
    name: `${method} ${route}`,
    kind: SpanKind.SERVER,
    attributes: {
      'http.method': method,
      'http.route': route,
      'http.target': route,
    }
  }, fn)
}

// External service tracing
export async function traceExternalCall<T>(
  service: string,
  operation: string,
  url: string,
  fn: (span: any) => Promise<T> | T
): Promise<T> {
  return createSpan({
    name: `${service}.${operation}`,
    kind: SpanKind.CLIENT,
    attributes: {
      'http.url': url,
      'service.name': service,
      'operation.name': operation,
    }
  }, fn)
}

// Business logic tracing
export async function traceBusiness<T>(
  feature: string,
  operation: string,
  attributes: Record<string, string | number | boolean> = {},
  fn: (span: any) => Promise<T> | T
): Promise<T> {
  return createSpan({
    name: `${feature}.${operation}`,
    kind: SpanKind.INTERNAL,
    attributes: {
      'feature.name': feature,
      'operation.name': operation,
      ...attributes
    }
  }, fn)
}

// Metrics collection utilities
export function recordMetric(
  name: string,
  value: number,
  labels: Record<string, string> = {}
) {
  try {
    const span = trace.getActiveSpan()
    // Add custom metrics collection here
    console.log(`Metric: ${name}=${value}`, labels, span ? 'with-span' : 'no-span')
  } catch (error) {
    console.error('Failed to record metric:', error)
  }
}

// Error tracking with spans
export function recordError(error: Error, context: Record<string, any> = {}) {
  const span = trace.getActiveSpan()
  if (span) {
    span.recordException(error)
    span.setAttributes({
      'error.type': error.constructor.name,
      'error.message': error.message,
      ...Object.entries(context).reduce((acc, [key, value]) => {
        acc[`context.${key}`] = String(value)
        return acc
      }, {} as Record<string, string>)
    })
  }
}

// Performance monitoring
export function startPerformanceSpan(name: string) {
  const span = tracer.startSpan(`performance.${name}`)
  const start = Date.now()
  
  return {
    end: (attributes: Record<string, any> = {}) => {
      const duration = Date.now() - start
      span.setAttributes({
        'performance.duration_ms': duration,
        ...attributes
      })
      span.end()
      return duration
    }
  }
}

// Initialization flag
let isInitialized = false

export function ensureTracingInitialized() {
  if (!isInitialized && process.env.NODE_ENV === 'production') {
    initializeTracing()
    isInitialized = true
  }
}
