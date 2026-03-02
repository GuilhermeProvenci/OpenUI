import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'OpenUI — Share & Discover UI Components',
  description:
    'An open platform for sharing UI components. Post React/JSX or HTML+CSS+JS components, vote on others\' work, suggest improvements, and fork components.',
  keywords: ['UI components', 'React', 'JSX', 'CSS', 'frontend', 'open source'],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'OpenUI — Share & Discover UI Components',
    description:
      'An open platform for sharing UI components. Like Reddit, but for frontend devs.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
