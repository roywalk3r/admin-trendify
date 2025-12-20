import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

// Type declarations for global objects
declare global {
  function gtag(...args: any[]): void
  const Sentry: {
    addBreadcrumb: (breadcrumb: any) => void
    captureMessage: (message: string, options?: any) => void
  }
}

export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

// Web Vitals thresholds (in milliseconds)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
}

export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

export function sendToAnalytics(metric: WebVitalsMetric) {
  // Send to multiple analytics providers
  
  // 1. Send to Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.rating,
      custom_parameter_3: metric.id,
    })
  }

  // 2. Send to custom analytics endpoint
  if (navigator.sendBeacon) {
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        rtt: (navigator as any).connection.rtt,
        downlink: (navigator as any).connection.downlink
      } : null
    })

    navigator.sendBeacon('/api/analytics/web-vitals', body)
  }

  // 3. Send to Sentry for performance monitoring
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    const sentry = (window as any).Sentry
    sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value}ms (${metric.rating})`,
      level: metric.rating === 'poor' ? 'warning' : 'info',
      data: {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id
      }
    })

    // Report poor metrics as performance issues
    if (metric.rating === 'poor') {
      sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
        level: 'warning',
        tags: {
          webVital: metric.name,
          rating: metric.rating,
          url: window.location.pathname
        },
        extra: {
          value: metric.value,
          id: metric.id,
          delta: metric.delta
        }
      })
    }
  }

  // 4. Console logging for development
  if (process.env.NODE_ENV === 'development') {
    const color = metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red'
    console.log(
      `%c${metric.name}: ${metric.value}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`,
      metric
    )
  }
}

export function reportWebVitals() {
  // Listen for each Web Vital
  onCLS((metric) => {
    sendToAnalytics({
      ...metric,
      rating: getRating('CLS', metric.value)
    } as WebVitalsMetric)
  })

  onINP((metric) => {
    sendToAnalytics({
      ...metric,
      rating: getRating('INP', metric.value)
    } as WebVitalsMetric)
  })

  onFCP((metric) => {
    sendToAnalytics({
      ...metric,
      rating: getRating('FCP', metric.value)
    } as WebVitalsMetric)
  })

  onLCP((metric) => {
    sendToAnalytics({
      ...metric,
      rating: getRating('LCP', metric.value)
    } as WebVitalsMetric)
  })

  onTTFB((metric) => {
    sendToAnalytics({
      ...metric,
      rating: getRating('TTFB', metric.value)
    } as WebVitalsMetric)
  })
}

// Additional performance metrics
export function trackCustomMetrics() {
  // Track JavaScript bundle loading time
  const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (navigationEntries.length > 0) {
    const navigation = navigationEntries[0]
    
    // DOM Content Loaded
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    sendToAnalytics({
      name: 'DCL',
      value: domContentLoaded,
      rating: getRating('FCP', domContentLoaded), // Use FCP threshold as proxy
      delta: domContentLoaded,
      id: `dcl-${Date.now()}`,
      navigationType: navigation.type
    } as WebVitalsMetric)

    // Total page load time
    const totalLoadTime = navigation.loadEventEnd - navigation.fetchStart
    sendToAnalytics({
      name: 'PLT',
      value: totalLoadTime,
      rating: getRating('LCP', totalLoadTime), // Use LCP threshold as proxy
      delta: totalLoadTime,
      id: `plt-${Date.now()}`,
      navigationType: navigation.type
    } as WebVitalsMetric)
  }

  // Track resource loading times
  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const criticalResources = resourceEntries.filter(resource => 
    resource.name.includes('.js') || 
    resource.name.includes('.css') ||
    resource.name.includes('font')
  )

  criticalResources.forEach(resource => {
    const loadTime = resource.responseEnd - resource.fetchStart
    if (loadTime > 1000) { // Only track slow resources
      sendToAnalytics({
        name: 'RLT',
        value: loadTime,
        rating: loadTime < 1000 ? 'good' : loadTime < 2000 ? 'needs-improvement' : 'poor',
        delta: loadTime,
        id: `rlt-${resource.name}-${Date.now()}`,
        navigationType: 'resource'
      } as WebVitalsMetric)
    }
  })
}

// Memory usage tracking
export function trackMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    
    sendToAnalytics({
      name: 'JSH',
      value: memory.usedJSHeapSize,
      rating: memory.usedJSHeapSize < 50000000 ? 'good' : memory.usedJSHeapSize < 100000000 ? 'needs-improvement' : 'poor',
      delta: memory.usedJSHeapSize,
      id: `jsh-${Date.now()}`,
      navigationType: 'memory'
    } as WebVitalsMetric)
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Start Web Vitals reporting
  reportWebVitals()

  // Track custom metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      trackCustomMetrics()
      trackMemoryUsage()
    }, 1000)
  })

  // Track metrics periodically for SPA navigation
  let lastUrl = location.href
  new MutationObserver(() => {
    const url = location.href
    if (url !== lastUrl) {
      lastUrl = url
      setTimeout(() => {
        trackCustomMetrics()
      }, 1000)
    }
  }).observe(document, { subtree: true, childList: true })
}
