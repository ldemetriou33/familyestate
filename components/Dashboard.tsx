'use client'

import { useState } from 'react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import Sidebar from './Sidebar'
import Header from './Header'
import PortfolioSectionWrapper from './sections/PortfolioSectionWrapper'
import UKDebtSection from './sections/UKDebtSection'
import HospitalitySection from './sections/HospitalitySection'
import FBSection from './sections/FBSection'

type Section = 'portfolio' | 'uk-debt' | 'hospitality' | 'f&b'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [activeSection, setActiveSection] = useState<Section>('portfolio')

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-bloomberg-dark">
        <div className="text-bloomberg-text">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Middleware will redirect to sign-in
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'portfolio':
        return <PortfolioSectionWrapper />
      case 'uk-debt':
        return <UKDebtSection />
      case 'hospitality':
        return <HospitalitySection />
      case 'f&b':
        return <FBSection />
      default:
        return <PortfolioSectionWrapper />
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
