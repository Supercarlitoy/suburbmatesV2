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
  // External packages for server components (updated for Next.js 15+)
  serverExternalPackages: ['@prisma/client'],
  // Experimental features
  experimental: {
    // Add any experimental features here if needed
  },
}

export default nextConfig
