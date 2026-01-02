import { ThemeProvider } from '@/contexts/ThemeContext'
import { IntegrationsProvider } from '@/contexts/IntegrationsContext'
import { ApprovalsProvider } from '@/contexts/ApprovalsContext'

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <IntegrationsProvider>
        <ApprovalsProvider>
          <div className="min-h-screen bg-[var(--bg-primary)] p-6">
            {children}
          </div>
        </ApprovalsProvider>
      </IntegrationsProvider>
    </ThemeProvider>
  )
}

