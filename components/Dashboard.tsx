'use client'

import { useState } from 'react'
import Sidebar, { Section } from './Sidebar'
import Header from './Header'
import CommandCenterSection from './sections/CommandCenterSection'
import HotelSection from './sections/HotelSection'
import FBSection from './sections/FBSection'
import PortfolioSection from './sections/PortfolioSection'
import FinanceSection from './sections/FinanceSection'
import { SettingsPage } from './settings/SettingsPage'
import { IntegrationsPage } from './integrations/IntegrationsPage'
import { alerts } from '@/lib/mock-data/seed'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('appearance')
  const [integrationsOpen, setIntegrationsOpen] = useState(false)

  // Count critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.isDismissed).length

  const handleSectionChange = (section: Section) => {
    setActiveSection(section)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const handleOpenSettings = (tab?: string) => {
    // Special case: open dedicated integrations page
    if (tab === 'integrations') {
      setIntegrationsOpen(true)
      return
    }
    if (tab) setSettingsTab(tab)
    setSettingsOpen(true)
  }

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
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, shown on lg+ */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={handleSectionChange}
          criticalAlerts={criticalAlerts}
          onClose={() => setSidebarOpen(false)}
          onOpenSettings={handleOpenSettings}
        />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          activeSection={activeSection} 
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={handleSectionChange}
          onOpenSettings={handleOpenSettings}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-3 md:p-6 bg-[var(--bg-primary)]">
          {renderSection()}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsPage 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
      />

      {/* Integrations Modal */}
      <IntegrationsPage
        isOpen={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
      />
    </div>
  )
}
