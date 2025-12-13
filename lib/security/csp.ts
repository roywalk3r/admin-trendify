import { randomBytes } from 'crypto'

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64')
}

/**
 * CSP utility functions
 */
export class CSPUtils {
  /**
   * Build CSP with nonce
   */
  static buildCSP(nonce?: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const clerkDomains = [
      "https://clerk.com",
      "https://*.clerk.accounts.dev",
      "https://*.clerk.com",
      "https://api.clerk.com",
    ]
    const appwriteDomains = [
      "https://cloud.appwrite.io",
      "https://fra.cloud.appwrite.io",
    ]
    const paymentDomains = [
      "https://js.paystack.co",
      "https://api.paystack.co",
    ]
    const analyticsDomains = [
      "https://vitals.vercel-insights.com",
    ]
    const sentryDomains = [
      "https://*.ingest.de.sentry.io",
      "https://*.ingest.sentry.io",
    ]
    const googleAnalyticsDomains = [
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ]

    const self = "'self'"
    const nonceValue = nonce ? `'nonce-${nonce}'` : ''
    const unsafeEval = "'unsafe-eval'" // Required by Next.js in development

    return [
      `default-src ${self}`,
      `base-uri ${self}`,
      `frame-ancestors ${self}`,
      `img-src ${self} data: blob: https:`,
      `font-src ${self} https://fonts.gstatic.com data:`,
      `style-src ${self} https://fonts.googleapis.com ${nonceValue}`,
      `script-src ${self} ${nonceValue} ${unsafeEval} ${clerkDomains.join(" ")} ${paymentDomains.join(" ")} ${googleAnalyticsDomains.join(" ")}`,
      `worker-src ${self} blob:`,
      `connect-src ${self} ${appUrl} ${clerkDomains.join(" ")} ${appwriteDomains.join(" ")} ${paymentDomains.join(" ")} ${analyticsDomains.join(" ")} ${sentryDomains.join(" ")} ${googleAnalyticsDomains.join(" ")}`,
      `frame-src ${self} ${paymentDomains.join(" ")} ${clerkDomains.join(" ")}`,
      `form-action ${self}`,
      `object-src 'none'`,
      `upgrade-insecure-requests`,
    ].join("; ")
  }

  /**
   * Get nonce from request headers
   */
  static getNonceFromRequest(request: Request): string | null {
    return request.headers.get('x-csp-nonce')
  }

  /**
   * Set nonce in response headers
   */
  static setNonceInResponse(response: Response, nonce: string): void {
    response.headers.set('x-csp-nonce', nonce)
    response.headers.set('Content-Security-Policy', this.buildCSP(nonce))
  }
}

/**
 * React hook for getting CSP nonce
 */
export function useCSPNonce(): string {
  // This would be used in client components
  // In a real implementation, you'd get this from a context or server props
  if (typeof window !== 'undefined') {
    // Client-side: get from meta tag or global
    const metaNonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content')
    return metaNonce || ''
  }
  return ''
}

/**
 * Server-side utility to inject nonce into HTML
 */
export function injectNonceIntoHTML(html: string, nonce: string): string {
  // Inject nonce into head
  const nonceMetaTag = `<meta name="csp-nonce" content="${nonce}">`
  const headEndIndex = html.indexOf('</head>')
  
  if (headEndIndex !== -1) {
    return html.slice(0, headEndIndex) + nonceMetaTag + html.slice(headEndIndex)
  }
  
  return html
}
