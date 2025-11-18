/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Configure headers for PWA
    async headers() {
        return [
            {
                source: '/manifest.json',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/manifest+json',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                ],
            },
        ];
    },

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },

    // Turbopack configuration (empty to silence the warning)
    turbopack: {},

    // Keep webpack config for production builds
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;