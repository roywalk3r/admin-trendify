import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ['*.localhost','fliq.ip-ddns.com', '*.pagekite.me'],
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
