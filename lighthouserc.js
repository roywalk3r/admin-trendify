module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        // Main user flows
        'http://localhost:3000/en',
        'http://localhost:3000/en/products',
        'http://localhost:3000/en/cart',
        'http://localhost:3000/en/checkout',
        // Admin flows  
        'http://localhost:3000/en/admin',
        'http://localhost:3000/en/admin/products',
        'http://localhost:3000/en/admin/orders',
        'http://localhost:3000/en/admin/users',
      ],
      startServerCommand: 'pnpm dev',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 60000,
      settings: {
        // Test both mobile and desktop
        preset: 'perf',
        // Mobile-first configuration
        formFactor: 'mobile',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false
        },
        emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      }
    },
    assert: {
      assertions: {
        // Performance thresholds for mobile
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
        'categories:pwa': ['off'], // Will enable when PWA is implemented
        // Core Web Vitals thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // Accessibility requirements
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
        // SEO basics
        'document-title': 'error',
        'meta-description': 'warn',
        'crawlable-anchors': 'warn'
      },
    },
    upload: {
      target: 'temporary-public-storage',
      token: process.env.LHCI_TOKEN,
      serverBaseUrl: process.env.LHCI_SERVER_URL
    },
  },
};
