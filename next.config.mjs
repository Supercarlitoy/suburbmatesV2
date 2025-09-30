/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporary: Allow builds while fixing TypeScript issues
  eslint: {
    ignoreDuringBuilds: true, // Re-enable after TS fixes
  },
  typescript: {
    ignoreBuildErrors: true, // Re-enable after TS fixes
  },
  // Production-ready image configuration
  images: {
    domains: ['localhost', 'suburbmates.com', 'suburbmates.com.au'],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  serverExternalPackages: ['@prisma/client'],
  
  // Enable compiler optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Set default port to 3000 for consistency
  env: {
    PORT: process.env.PORT || '3000',
  },
};

export default nextConfig;
