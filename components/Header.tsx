'use client'

import { useState, useEffect } from 'react'
import { Clock, Bell, Settings, Search } from 'lucide-react'

type Section = 'portfolio' | 'uk-debt' | 'hospitality' | 'f&b'

interface HeaderProps {
  activeSection: Section
}

const sectionTitles: Record<Section, string> = {
  portfolio: 'Portfolio Management',
  'uk-debt': 'UK Debt Operations',
  hospitality: 'Hospitality Dashboard',
  'f&b': 'Food & Beverage Operations',
}

export default function Header({ activeSection }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('--:--:--')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }

    // Set initial time
    updateTime()

    // Update every second
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-16 border-b border-bloomberg-border bg-bloomberg-panel flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-semibold text-bloomberg-text">
          {sectionTitles[activeSection]}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bloomberg-darker rounded-lg border border-bloomberg-border">
          <Clock className="w-4 h-4 text-bloomberg-textMuted" />
          <span className="text-sm font-mono text-bloomberg-text">{currentTime}</span>
        </div>
        
        <button className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors">
          <Search className="w-5 h-5 text-bloomberg-textMuted" />
        </button>
        
        <button className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-bloomberg-textMuted" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-bloomberg-danger rounded-full"></span>
        </button>
        
        <button className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-bloomberg-textMuted" />
        </button>
      </div>
    </header>
  )
}

