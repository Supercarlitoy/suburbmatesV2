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
  // Enable standalone output for Docker
  output: 'standalone',
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  // Experimental features for Next.js 15+
  experimental: {
    // Add experimental features here if needed
  },
}

export default nextConfig
