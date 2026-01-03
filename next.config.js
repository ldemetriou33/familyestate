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

module.exports = nextConfig

// Trigger redeploy Fri Jan  2 20:35:10 +04 2026
// Trigger redeploy Fri Jan  2 21:02:45 +04 2026
