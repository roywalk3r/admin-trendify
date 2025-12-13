import type { NextConfig } from "next";

// Build a strict but compatible Content Security Policy with nonce support
function buildCSP(nonce?: string) {
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
    // Uncomment if Stripe is added later
    // "https://js.stripe.com",
    // "https://api.stripe.com",
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

  const csp = [
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

  return csp
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
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
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    }

    // Reduce bundle size by removing moment.js locales if not needed
    config.resolve.alias = {
      ...config.resolve.alias,
      'moment': false,
    }

    return config
  },
  images: {
    remotePatterns: [
      // new URL('https://fra.cloud.appwrite.io/**'),
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
        port: '',
        pathname: '/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'admin-trendify.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        port: '',
        pathname: '/v1/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: buildCSP(), // Will be updated by middleware with nonce
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

};

export default nextConfig;
