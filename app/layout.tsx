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
