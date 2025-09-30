import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/providers/SessionProvider'
import { Toaster } from '@/components/ui/toaster'
import Analytics from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SuburbMates - Melbourne Business Community Platform',
  description: 'Connect with verified local businesses in Melbourne through our trusted community platform',
  generator: 'Next.js',
  applicationName: 'SuburbMates',
  keywords: ['Melbourne', 'business', 'community', 'local business', 'directory', 'networking'],
  authors: [{ name: 'SuburbMates' }],
  creator: 'SuburbMates',
  publisher: 'SuburbMates',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo-mark.svg', type: 'image/svg+xml', sizes: '32x32' }
    ],
    apple: '/logo-mark.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://suburbmates.com.au',
    siteName: 'SuburbMates',
    title: 'SuburbMates - Melbourne Business Community Platform',
    description: 'Connect with verified local businesses in Melbourne through our trusted community platform',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'SuburbMates - Melbourne Business Community Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuburbMates - Melbourne Business Community Platform',
    description: 'Connect with verified local businesses in Melbourne through our trusted community platform',
    images: ['/og-image-default.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          {children}
          <Toaster />
        </AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
