const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma client is only used server-side
      config.externals = [...(config.externals || []), '@prisma/client']
    }
    return config
  },
}

module.exports = withPWA(nextConfig)

// Trigger redeploy Fri Jan  2 20:35:10 +04 2026
// Trigger redeploy Fri Jan  2 21:02:45 +04 2026
