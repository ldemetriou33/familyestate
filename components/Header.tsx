'use client'

import { useState, useEffect } from 'react'
import { Clock, Bell, Settings, Search, RefreshCw, User, Menu } from 'lucide-react'
import { Section } from './Sidebar'

interface HeaderProps {
  activeSection: Section
  onMenuClick?: () => void
}

const sectionTitles: Record<Section, string> = {
  home: 'Command Center',
  hotel: 'Hotel Operations',
  'f&b': 'Food & Beverage',
  portfolio: 'Portfolio Management',
  finance: 'Finance & Debt',
}

const sectionDescriptions: Record<Section, string> = {
  home: 'Overview of critical alerts, actions, and forecasts',
  hotel: 'Occupancy, bookings, and room management',
  'f&b': 'Cafe sales, margins, and performance tracking',
  portfolio: 'Rent roll, arrears, and compliance',
  finance: 'Cashflow, debt schedule, and projections',
}

export default function Header({ activeSection, onMenuClick }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('--:--:--')
  const [currentDate, setCurrentDate] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-14 md:h-16 border-b border-bloomberg-border bg-bloomberg-panel flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-3 md:gap-6">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-bloomberg-darker rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-bloomberg-textMuted" />
        </button>
        
        <div className="min-w-0">
          <h2 className="text-base md:text-xl font-semibold text-bloomberg-text truncate">
            {sectionTitles[activeSection]}
          </h2>
          <p className="text-xs text-bloomberg-textMuted hidden sm:block truncate">
            {sectionDescriptions[activeSection]}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Date & Time - hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 bg-bloomberg-darker rounded-lg border border-bloomberg-border">
          <Clock className="w-4 h-4 text-bloomberg-textMuted hidden md:block" />
          <div className="text-right">
            <span className="text-xs md:text-sm font-mono text-bloomberg-text block">{currentTime}</span>
            <span className="text-xs text-bloomberg-textMuted hidden md:block">{currentDate}</span>
          </div>
        </div>
        
        {/* Refresh Button - hidden on mobile */}
        <button className="hidden md:block p-2 hover:bg-bloomberg-darker rounded-lg transition-colors" title="Refresh Data">
          <RefreshCw className="w-5 h-5 text-bloomberg-textMuted hover:text-bloomberg-accent transition-colors" />
        </button>

        {/* Search - hidden on mobile */}
        <button className="hidden md:block p-2 hover:bg-bloomberg-darker rounded-lg transition-colors">
          <Search className="w-5 h-5 text-bloomberg-textMuted" />
        </button>
        
        {/* Notifications */}
        <button className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-bloomberg-textMuted" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-bloomberg-danger rounded-full"></span>
        </button>
        
        {/* Settings - hidden on mobile */}
        <button className="hidden md:block p-2 hover:bg-bloomberg-darker rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-bloomberg-textMuted" />
        </button>

        {/* User Avatar - hidden on mobile (shown in sidebar) */}
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-bloomberg-border">
          <div className="w-8 h-8 rounded-full bg-bloomberg-accent/20 flex items-center justify-center">
            <User className="w-4 h-4 text-bloomberg-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-bloomberg-text">Admin</p>
            <p className="text-xs text-bloomberg-textMuted">Estate Manager</p>
          </div>
        </div>
      </div>
    </header>
  )
}
