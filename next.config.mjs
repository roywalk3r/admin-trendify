import {withSentryConfig} from '@sentry/nextjs';
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
  const sentryDomains = [
    'https://*.ingest.de.sentry.io',
    'https://*.ingest.sentry.io',
  ]
  const googleAnalyticsDomains = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
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
    `script-src ${self} ${unsafeInline} ${unsafeEval} ${clerkDomains.join(' ')} ${paymentDomains.join(' ')} ${googleAnalyticsDomains.join(' ')}`,
    `worker-src ${self} blob:`,
    `connect-src ${self} ${appUrl} ${clerkDomains.join(' ')} ${appwriteDomains.join(' ')} ${paymentDomains.join(' ')} ${analyticsDomains.join(' ')} ${sentryDomains.join(' ')} ${googleAnalyticsDomains.join(' ')}`,
    `frame-src ${self} ${paymentDomains.join(' ')} ${clerkDomains.join(' ')}`,
    `form-action ${self}`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@hookform/resolvers',
      'class-variance-authority',
      'clsx',
      'cmdk',
      'sonner'
    ],
  },
  images: {
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
  // Keep heavy logger dependencies external so Turbopack doesn't try to parse their tests/fixtures
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream', 'sonic-boom', 'real-require'],
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "aerk-org",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true
});
