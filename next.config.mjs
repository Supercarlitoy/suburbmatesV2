/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    // any experimental features you need
  },
  output: undefined, // explicitly disable 'standalone' output
}

module.exports = nextConfig;
