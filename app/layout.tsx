import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { IntegrationsProvider } from '@/contexts/IntegrationsContext'
import { ApprovalsProvider } from '@/contexts/ApprovalsContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Abbey OS - Family Estate Autopilot',
  description: 'Mixed-use portfolio management: Hotel, Cafe, Residential Flats',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Abbey OS',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192x192.png',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${inter.className} density-comfortable bg-slate-50`}>
        <ThemeProvider>
          <IntegrationsProvider>
            <ApprovalsProvider>
              {children}
            </ApprovalsProvider>
          </IntegrationsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
