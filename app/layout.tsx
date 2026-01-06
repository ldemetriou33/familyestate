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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Abbey OS',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Abbey OS" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
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
