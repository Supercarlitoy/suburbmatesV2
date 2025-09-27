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
