'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Clock, 
  Bell, 
  Settings, 
  Search, 
  RefreshCw, 
  User, 
  Menu,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  ChevronRight
} from 'lucide-react'
import { Section } from './Sidebar'
import { alerts } from '@/lib/mock-data/seed'

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
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
    // Could trigger a real data refresh here
    window.location.reload()
  }

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const activeAlerts = alerts.filter(a => !a.isDismissed && !dismissedAlerts.has(a.id))
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'WARNING': return <AlertCircle className="w-4 h-4 text-amber-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const searchItems = [
    { type: 'Property', items: ['The Grand Hotel', 'Abbey Cafe', 'Victoria Apartments', 'Riverside Flats'] },
    { type: 'Tenant', items: ['John Smith', 'Sarah Connor', 'James Wilson', 'Emma Thompson'] },
    { type: 'Action', items: ['Arrears Chase', 'Gas Safety', 'Rate Review', 'Maintenance'] },
  ]

  const filteredSearchItems = searchQuery 
    ? searchItems.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : []

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
        
        {/* Refresh Button */}
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="hidden md:block p-2 hover:bg-bloomberg-darker rounded-lg transition-colors disabled:opacity-50" 
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 text-bloomberg-textMuted hover:text-bloomberg-accent transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-bloomberg-textMuted" />
          </button>

          {/* Search Dropdown */}
          {showSearch && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-bloomberg-darker border border-bloomberg-border rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-bloomberg-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bloomberg-textMuted" />
                  <input
                    type="text"
                    placeholder="Search properties, tenants, actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-sm text-bloomberg-text placeholder:text-bloomberg-textMuted focus:outline-none focus:border-bloomberg-accent"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {searchQuery === '' ? (
                  <div className="p-4 text-center text-sm text-bloomberg-textMuted">
                    Start typing to search...
                  </div>
                ) : filteredSearchItems.length === 0 ? (
                  <div className="p-4 text-center text-sm text-bloomberg-textMuted">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredSearchItems.map(category => (
                    <div key={category.type} className="p-2">
                      <p className="text-xs font-semibold text-bloomberg-textMuted px-2 mb-1">{category.type}</p>
                      {category.items.map(item => (
                        <button
                          key={item}
                          className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center justify-between"
                          onClick={() => {
                            setShowSearch(false)
                            setSearchQuery('')
                          }}
                        >
                          <span>{item}</span>
                          <ChevronRight className="w-4 h-4 text-bloomberg-textMuted" />
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-bloomberg-textMuted" />
            {activeAlerts.length > 0 && (
              <span className={`absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold rounded-full ${
                criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
              } text-white`}>
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-bloomberg-darker border border-bloomberg-border rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-bloomberg-border flex items-center justify-between">
                <h3 className="font-semibold text-bloomberg-text">Notifications</h3>
                {activeAlerts.length > 0 && (
                  <span className="text-xs text-bloomberg-textMuted">{activeAlerts.length} unread</span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Check className="w-8 h-8 text-bloomberg-success mx-auto mb-2" />
                    <p className="text-sm text-bloomberg-textMuted">All caught up!</p>
                  </div>
                ) : (
                  activeAlerts.slice(0, 8).map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3 border-b border-bloomberg-border hover:bg-bloomberg-panel transition-colors ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-bloomberg-text truncate">{alert.title}</p>
                          <p className="text-xs text-bloomberg-textMuted mt-0.5 line-clamp-2">{alert.message}</p>
                          <p className="text-xs text-bloomberg-textMuted mt-1">
                            {new Date(alert.createdAt).toLocaleString('en-GB', { 
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="p-1 hover:bg-bloomberg-darker rounded"
                        >
                          <X className="w-3 h-3 text-bloomberg-textMuted" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {activeAlerts.length > 0 && (
                <div className="p-2 border-t border-bloomberg-border">
                  <button className="w-full py-2 text-sm text-bloomberg-accent hover:underline">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Settings */}
        <div className="relative hidden md:block" ref={settingsRef}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-bloomberg-textMuted" />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-bloomberg-darker border border-bloomberg-border rounded-lg shadow-xl z-50">
              <div className="p-3 border-b border-bloomberg-border">
                <h3 className="font-semibold text-bloomberg-text">Settings</h3>
              </div>
              <div className="p-2">
                <button className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg">
                  Notification Preferences
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg">
                  Display Settings
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg">
                  Data Refresh Rate
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg">
                  Export Data
                </button>
                <div className="border-t border-bloomberg-border my-2"></div>
                <button className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg">
                  Integrations
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg">
                  Approval Thresholds
                </button>
              </div>
            </div>
          )}
        </div>

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
