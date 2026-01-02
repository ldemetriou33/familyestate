'use client'

import { useState } from 'react'
import Sidebar, { Section } from './Sidebar'
import Header from './Header'
import CommandCenterSection from './sections/CommandCenterSection'
import HotelSection from './sections/HotelSection'
import FBSection from './sections/FBSection'
import PortfolioSection from './sections/PortfolioSection'
import FinanceSection from './sections/FinanceSection'
import { alerts } from '@/lib/mock-data/seed'

// Check if Clerk is configured at runtime
const isClerkConfigured = typeof window !== 'undefined' && 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('home')

  // Count critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.isDismissed).length

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <CommandCenterSection />
      case 'hotel':
        return <HotelSection />
      case 'f&b':
        return <FBSection />
      case 'portfolio':
        return <PortfolioSection />
      case 'finance':
        return <FinanceSection />
      default:
        return <CommandCenterSection />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bloomberg-dark">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        criticalAlerts={criticalAlerts}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header activeSection={activeSection} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
