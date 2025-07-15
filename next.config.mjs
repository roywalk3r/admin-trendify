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
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'ngrok-skip-browser-warning',
            value: 'true',
          },
        ],
      },
    ];
  },
}

export default nextConfig

