import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SuburbMates',
  description: 'Find verified businesses in your suburb. ABN-verified listings curated by suburb for Melbourne.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-neutral-950 text-neutral-100">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}