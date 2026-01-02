import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Abbey OS v2 - Dashboard',
  description: 'Bloomberg-style dashboard for Portfolio, UK Debt, Hospitality, and F&B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

