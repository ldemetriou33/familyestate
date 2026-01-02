'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import PortfolioSection from './sections/PortfolioSection'
import UKDebtSection from './sections/UKDebtSection'
import HospitalitySection from './sections/HospitalitySection'
import FBSection from './sections/FBSection'

type Section = 'portfolio' | 'uk-debt' | 'hospitality' | 'f&b'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('portfolio')

  const renderSection = () => {
    switch (activeSection) {
      case 'portfolio':
        return <PortfolioSection />
      case 'uk-debt':
        return <UKDebtSection />
      case 'hospitality':
        return <HospitalitySection />
      case 'f&b':
        return <FBSection />
      default:
        return <PortfolioSection />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bloomberg-dark">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header activeSection={activeSection} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}

