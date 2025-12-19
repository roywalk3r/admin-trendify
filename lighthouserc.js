module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'http://localhost:3000/admin',
        'http://localhost:3000/admin/reviews',
        'http://localhost:3000/admin/orders',
        'http://localhost:3000/admin/drivers',
      ],
      startServerCommand: 'pnpm dev',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['off'],
        'categories:pwa': ['off'],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
