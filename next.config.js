/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => null,
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig
