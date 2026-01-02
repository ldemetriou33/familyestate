import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#00d4ff',
        },
      }}
    >
      <html lang="en" data-theme="dark" suppressHydrationWarning>
        <body className={`${inter.className} density-comfortable`}>
          <ThemeProvider>
            <IntegrationsProvider>
              <ApprovalsProvider>
                {children}
              </ApprovalsProvider>
            </IntegrationsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
