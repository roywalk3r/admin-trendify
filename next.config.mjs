function buildCSP() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const clerkDomains = [
    'https://clerk.com',
    'https://*.clerk.accounts.dev',
    'https://*.clerk.com',
    'https://api.clerk.com',
  ]
  const appwriteDomains = [
    'https://cloud.appwrite.io',
    'https://fra.cloud.appwrite.io',
  ]
  const paymentDomains = [
    'https://js.paystack.co',
    'https://api.paystack.co',
  ]
  const analyticsDomains = [
    'https://vitals.vercel-insights.com',
  ]

  const self = "'self'"
  const unsafeInline = "'unsafe-inline'"
  const unsafeEval = "'unsafe-eval'"

  return [
    `default-src ${self}`,
    `base-uri ${self}`,
    `frame-ancestors ${self}`,
    `img-src ${self} data: blob: https:`,
    `font-src ${self} https://fonts.gstatic.com data:`,
    `style-src ${self} ${unsafeInline} https://fonts.googleapis.com`,
    `script-src ${self} ${unsafeInline} ${unsafeEval} ${clerkDomains.join(' ')} ${paymentDomains.join(' ')}`,
    `connect-src ${self} ${appUrl} ${clerkDomains.join(' ')} ${appwriteDomains.join(' ')} ${paymentDomains.join(' ')} ${analyticsDomains.join(' ')}`,
    `frame-src ${self} ${paymentDomains.join(' ')} ${clerkDomains.join(' ')}`,
    `form-action ${self}`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

const nextConfig = {
  images: {
    domains: [
      'cloud.appwrite.io',
      'localhost',
      'placeholder.svg'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin-trendify.vercel.app',
        port: '',
        pathname: '/**',
      }
    ],
  },
  eslint: {
    // Allow production builds to complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          { key: 'ngrok-skip-browser-warning', value: 'true' },
          { key: 'Content-Security-Policy', value: buildCSP() },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // API CORS headers
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.CORS_ALLOW_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },
}

export default nextConfig
