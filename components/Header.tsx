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
  ChevronRight,
  Building2,
  Wallet,
  FileText
} from 'lucide-react'
import { Section } from './Sidebar'
import { alerts } from '@/lib/mock-data/seed'

interface HeaderProps {
  activeSection: Section
  onMenuClick?: () => void
  onNavigate?: (section: Section) => void
  onOpenSettings?: (tab?: string) => void
}

const sectionTitles: Record<Section, string> = {
  home: 'Command Center',
  hotel: 'Hotel Operations',
  'f&b': 'Food & Beverage',
  portfolio: 'Portfolio Management',
  finance: 'Finance & Debt',
  'legal-brain': 'Legal Brain',
}

const sectionDescriptions: Record<Section, string> = {
  home: 'Overview of critical alerts, actions, and forecasts',
  hotel: 'Occupancy, bookings, and room management',
  'legal-brain': 'AI-powered document analysis and legal reasoning',
  'f&b': 'Cafe sales, margins, and performance tracking',
  portfolio: 'Rent roll, arrears, and compliance',
  finance: 'Cashflow, debt schedule, and projections',
}

export default function Header({ activeSection, onMenuClick, onNavigate, onOpenSettings }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('--:--:--')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null)
  const [showAlertDetail, setShowAlertDetail] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
    window.location.reload()
  }

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const handleViewAlertDetails = (alert: typeof alerts[0]) => {
    setSelectedAlert(alert)
    setShowAlertDetail(true)
    setShowNotifications(false)
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
    { 
      type: 'Property', 
      icon: Building2,
      items: [
        { name: 'The Grand Hotel', section: 'hotel' as Section },
        { name: 'Abbey Cafe', section: 'f&b' as Section },
        { name: 'Victoria Apartments', section: 'portfolio' as Section },
        { name: 'Riverside Flats', section: 'portfolio' as Section }
      ] 
    },
    { 
      type: 'Tenant', 
      icon: User,
      items: [
        { name: 'John Smith - Flat 2A', section: 'portfolio' as Section },
        { name: 'Sarah Connor - Flat 3B', section: 'portfolio' as Section },
        { name: 'James Wilson - Flat 1C', section: 'portfolio' as Section }
      ] 
    },
    { 
      type: 'Action', 
      icon: FileText,
      items: [
        { name: 'Arrears Chase - Flat 4B', section: 'home' as Section },
        { name: 'Gas Safety - Victoria Apts', section: 'home' as Section },
        { name: 'Rate Review - Hotel', section: 'hotel' as Section }
      ] 
    },
    { 
      type: 'Finance', 
      icon: Wallet,
      items: [
        { name: 'Cash Position', section: 'finance' as Section },
        { name: 'Debt Schedule', section: 'finance' as Section },
        { name: 'Reconciliation', section: 'finance' as Section }
      ] 
    },
  ]

  const filteredSearchItems = searchQuery 
    ? searchItems.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : []

  return (
    <>
      <header className="h-14 md:h-16 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          
          <div className="min-w-0">
            <h2 className="text-base md:text-xl font-semibold text-[var(--text-primary)] truncate">
              {sectionTitles[activeSection]}
            </h2>
            <p className="text-xs text-[var(--text-muted)] hidden sm:block truncate">
              {sectionDescriptions[activeSection]}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Date & Time */}
          <div className="hidden sm:flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]">
            <Clock className="w-4 h-4 text-[var(--text-muted)] hidden md:block" />
            <div className="text-right">
              <span className="text-xs md:text-sm font-mono text-[var(--text-primary)] block">{currentTime}</span>
              <span className="text-xs text-[var(--text-muted)] hidden md:block">{currentDate}</span>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hidden md:block p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors disabled:opacity-50" 
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Search */}
          <div className="relative hidden md:block" ref={searchRef}>
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-[var(--border-primary)]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Search properties, tenants, actions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {searchQuery === '' ? (
                    <div className="p-2">
                      <p className="text-xs font-semibold text-[var(--text-muted)] px-2 mb-2">Quick Navigation</p>
                      {searchItems.map(category => {
                        const Icon = category.icon
                        return (
                          <div key={category.type} className="mb-2">
                            <p className="text-xs text-[var(--text-muted)] px-2 py-1 flex items-center gap-2">
                              <Icon className="w-3 h-3" />
                              {category.type}
                            </p>
                            {category.items.slice(0, 2).map(item => (
                              <button
                                key={item.name}
                                className="w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg flex items-center justify-between"
                                onClick={() => {
                                  if (onNavigate) onNavigate(item.section)
                                  setShowSearch(false)
                                }}
                              >
                                <span>{item.name}</span>
                                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                              </button>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ) : filteredSearchItems.length === 0 ? (
                    <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                      No results found for &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredSearchItems.map(category => {
                      const Icon = category.icon
                      return (
                        <div key={category.type} className="p-2">
                          <p className="text-xs font-semibold text-[var(--text-muted)] px-2 mb-1 flex items-center gap-2">
                            <Icon className="w-3 h-3" />
                            {category.type}
                          </p>
                          {category.items.map(item => (
                            <button
                              key={item.name}
                              className="w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg flex items-center justify-between"
                              onClick={() => {
                                if (onNavigate) onNavigate(item.section)
                                setShowSearch(false)
                                setSearchQuery('')
                              }}
                            >
                              <span>{item.name}</span>
                              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                          ))}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-[var(--text-muted)]" />
              {activeAlerts.length > 0 && (
                <span className={`absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold rounded-full ${
                  criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
                } text-white`}>
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-[var(--border-primary)] flex items-center justify-between">
                  <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
                  {activeAlerts.length > 0 && (
                    <span className="text-xs text-[var(--text-muted)]">{activeAlerts.length} unread</span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {activeAlerts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Check className="w-8 h-8 text-[var(--success)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--text-muted)]">All caught up!</p>
                    </div>
                  ) : (
                    activeAlerts.slice(0, 8).map(alert => (
                      <div 
                        key={alert.id}
                        className={`p-3 border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                          alert.severity === 'CRITICAL' ? 'bg-red-500/5' : ''
                        }`}
                        onClick={() => handleViewAlertDetails(alert)}
                      >
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{alert.title}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{alert.message}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {new Date(alert.createdAt).toLocaleString('en-GB', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDismissAlert(alert.id)
                            }}
                            className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
                          >
                            <X className="w-3 h-3 text-[var(--text-muted)]" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {activeAlerts.length > 0 && (
                  <div className="p-2 border-t border-[var(--border-primary)]">
                    <button 
                      className="w-full py-2 text-sm text-[var(--accent)] hover:underline"
                      onClick={() => {
                        setShowAllNotifications(true)
                        setShowNotifications(false)
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Settings */}
          <button 
            onClick={() => onOpenSettings?.('appearance')}
            className="hidden md:block p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          {/* User Avatar */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-[var(--border-primary)]">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Admin</p>
              <p className="text-xs text-[var(--text-muted)]">Estate Manager</p>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Detail Modal */}
      {showAlertDetail && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSeverityIcon(selectedAlert.severity)}
                <h3 className="font-semibold text-[var(--text-primary)]">Alert Details</h3>
              </div>
              <button 
                onClick={() => setShowAlertDetail(false)}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Title</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{selectedAlert.title}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Message</p>
                <p className="text-[var(--text-primary)]">{selectedAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Severity</p>
                  <span className={`inline-block px-2 py-1 text-sm rounded ${
                    selectedAlert.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                    selectedAlert.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {selectedAlert.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Category</p>
                  <p className="text-[var(--text-primary)]">{selectedAlert.category}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Created</p>
                <p className="text-[var(--text-primary)]">
                  {new Date(selectedAlert.createdAt).toLocaleString('en-GB', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-primary)] flex gap-3">
              <button
                onClick={() => {
                  handleDismissAlert(selectedAlert.id)
                  setShowAlertDetail(false)
                }}
                className="flex-1 py-2 px-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  if (onNavigate) {
                    if (selectedAlert.category === 'FINANCIAL') onNavigate('finance')
                    else if (selectedAlert.category === 'OCCUPANCY') onNavigate('hotel')
                    else if (selectedAlert.category === 'MAINTENANCE') onNavigate('portfolio')
                    else onNavigate('home')
                  }
                  setShowAlertDetail(false)
                }}
                className="flex-1 py-2 px-4 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
              >
                Take Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">All Notifications</h3>
              <button 
                onClick={() => setShowAllNotifications(false)}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                    dismissedAlerts.has(alert.id) ? 'opacity-50' : ''
                  } ${alert.severity === 'CRITICAL' && !dismissedAlerts.has(alert.id) ? 'bg-red-500/5' : ''}`}
                  onClick={() => {
                    setSelectedAlert(alert)
                    setShowAlertDetail(true)
                    setShowAllNotifications(false)
                  }}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">{alert.title}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">{alert.message}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        {new Date(alert.createdAt).toLocaleString('en-GB')}
                      </p>
                    </div>
                    {dismissedAlerts.has(alert.id) && (
                      <span className="text-xs text-[var(--text-muted)]">Dismissed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
