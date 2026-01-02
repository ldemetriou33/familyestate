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
  Hotel,
  Building2,
  UtensilsCrossed,
  Wallet,
  FileText,
  Download,
  Link2,
  Shield,
  BellRing,
  Monitor,
  Database
} from 'lucide-react'
import { Section } from './Sidebar'
import { alerts } from '@/lib/mock-data/seed'

interface HeaderProps {
  activeSection: Section
  onMenuClick?: () => void
  onNavigate?: (section: Section) => void
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

export default function Header({ activeSection, onMenuClick, onNavigate }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('--:--:--')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null)
  const [showAlertDetail, setShowAlertDetail] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState<string | null>(null)
  
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

  const handleSearchSelect = (type: string, item: string) => {
    setShowSearch(false)
    setSearchQuery('')
    
    // Navigate to appropriate section based on type
    if (onNavigate) {
      if (type === 'Property') {
        if (item.toLowerCase().includes('hotel')) {
          onNavigate('hotel')
        } else if (item.toLowerCase().includes('cafe')) {
          onNavigate('f&b')
        } else {
          onNavigate('portfolio')
        }
      } else if (type === 'Tenant') {
        onNavigate('portfolio')
      } else if (type === 'Action') {
        onNavigate('home')
      } else if (type === 'Finance') {
        onNavigate('finance')
      }
    }
  }

  const handleSettingsClick = (setting: string) => {
    setShowSettings(false)
    setShowSettingsModal(setting)
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
          {/* Date & Time */}
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
                    <div className="p-2">
                      <p className="text-xs font-semibold text-bloomberg-textMuted px-2 mb-2">Quick Navigation</p>
                      {searchItems.map(category => {
                        const Icon = category.icon
                        return (
                          <div key={category.type} className="mb-2">
                            <p className="text-xs text-bloomberg-textMuted px-2 py-1 flex items-center gap-2">
                              <Icon className="w-3 h-3" />
                              {category.type}
                            </p>
                            {category.items.slice(0, 2).map(item => (
                              <button
                                key={item.name}
                                className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center justify-between"
                                onClick={() => {
                                  if (onNavigate) onNavigate(item.section)
                                  setShowSearch(false)
                                }}
                              >
                                <span>{item.name}</span>
                                <ChevronRight className="w-4 h-4 text-bloomberg-textMuted" />
                              </button>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ) : filteredSearchItems.length === 0 ? (
                    <div className="p-4 text-center text-sm text-bloomberg-textMuted">
                      No results found for &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredSearchItems.map(category => {
                      const Icon = category.icon
                      return (
                        <div key={category.type} className="p-2">
                          <p className="text-xs font-semibold text-bloomberg-textMuted px-2 mb-1 flex items-center gap-2">
                            <Icon className="w-3 h-3" />
                            {category.type}
                          </p>
                          {category.items.map(item => (
                            <button
                              key={item.name}
                              className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center justify-between"
                              onClick={() => {
                                if (onNavigate) onNavigate(item.section)
                                setShowSearch(false)
                                setSearchQuery('')
                              }}
                            >
                              <span>{item.name}</span>
                              <ChevronRight className="w-4 h-4 text-bloomberg-textMuted" />
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
                        className={`p-3 border-b border-bloomberg-border hover:bg-bloomberg-panel transition-colors cursor-pointer ${
                          alert.severity === 'CRITICAL' ? 'bg-red-500/5' : ''
                        }`}
                        onClick={() => handleViewAlertDetails(alert)}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDismissAlert(alert.id)
                            }}
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
                    <button 
                      className="w-full py-2 text-sm text-bloomberg-accent hover:underline"
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
          <div className="relative hidden md:block" ref={settingsRef}>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-bloomberg-textMuted" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-bloomberg-darker border border-bloomberg-border rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-bloomberg-border">
                  <h3 className="font-semibold text-bloomberg-text">Settings</h3>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => handleSettingsClick('notifications')}
                    className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center gap-3"
                  >
                    <BellRing className="w-4 h-4 text-bloomberg-textMuted" />
                    Notification Preferences
                  </button>
                  <button 
                    onClick={() => handleSettingsClick('display')}
                    className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center gap-3"
                  >
                    <Monitor className="w-4 h-4 text-bloomberg-textMuted" />
                    Display Settings
                  </button>
                  <button 
                    onClick={() => handleSettingsClick('data')}
                    className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center gap-3"
                  >
                    <Database className="w-4 h-4 text-bloomberg-textMuted" />
                    Data Refresh Rate
                  </button>
                  <button 
                    onClick={() => handleSettingsClick('export')}
                    className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center gap-3"
                  >
                    <Download className="w-4 h-4 text-bloomberg-textMuted" />
                    Export Data
                  </button>
                  <div className="border-t border-bloomberg-border my-2"></div>
                  <button 
                    onClick={() => handleSettingsClick('integrations')}
                    className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center gap-3"
                  >
                    <Link2 className="w-4 h-4 text-bloomberg-textMuted" />
                    Integrations
                  </button>
                  <button 
                    onClick={() => handleSettingsClick('approvals')}
                    className="w-full px-3 py-2 text-left text-sm text-bloomberg-text hover:bg-bloomberg-panel rounded-lg flex items-center gap-3"
                  >
                    <Shield className="w-4 h-4 text-bloomberg-textMuted" />
                    Approval Thresholds
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
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

      {/* Alert Detail Modal */}
      {showAlertDetail && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bloomberg-darker border border-bloomberg-border rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-4 border-b border-bloomberg-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSeverityIcon(selectedAlert.severity)}
                <h3 className="font-semibold text-bloomberg-text">Alert Details</h3>
              </div>
              <button 
                onClick={() => setShowAlertDetail(false)}
                className="p-1 hover:bg-bloomberg-panel rounded"
              >
                <X className="w-5 h-5 text-bloomberg-textMuted" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-bloomberg-textMuted">Title</p>
                <p className="text-lg font-semibold text-bloomberg-text">{selectedAlert.title}</p>
              </div>
              <div>
                <p className="text-sm text-bloomberg-textMuted">Message</p>
                <p className="text-bloomberg-text">{selectedAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-bloomberg-textMuted">Severity</p>
                  <span className={`inline-block px-2 py-1 text-sm rounded ${
                    selectedAlert.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                    selectedAlert.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {selectedAlert.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-bloomberg-textMuted">Category</p>
                  <p className="text-bloomberg-text">{selectedAlert.category}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-bloomberg-textMuted">Created</p>
                <p className="text-bloomberg-text">
                  {new Date(selectedAlert.createdAt).toLocaleString('en-GB', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-bloomberg-border flex gap-3">
              <button
                onClick={() => {
                  handleDismissAlert(selectedAlert.id)
                  setShowAlertDetail(false)
                }}
                className="flex-1 py-2 px-4 bg-bloomberg-panel text-bloomberg-text rounded-lg hover:bg-bloomberg-border transition-colors"
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
                className="flex-1 py-2 px-4 bg-bloomberg-accent text-white rounded-lg hover:bg-bloomberg-accent/80 transition-colors"
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
          <div className="bg-bloomberg-darker border border-bloomberg-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-bloomberg-border flex items-center justify-between">
              <h3 className="font-semibold text-bloomberg-text">All Notifications</h3>
              <button 
                onClick={() => setShowAllNotifications(false)}
                className="p-1 hover:bg-bloomberg-panel rounded"
              >
                <X className="w-5 h-5 text-bloomberg-textMuted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 border-b border-bloomberg-border hover:bg-bloomberg-panel transition-colors cursor-pointer ${
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
                      <p className="font-medium text-bloomberg-text">{alert.title}</p>
                      <p className="text-sm text-bloomberg-textMuted mt-1">{alert.message}</p>
                      <p className="text-xs text-bloomberg-textMuted mt-2">
                        {new Date(alert.createdAt).toLocaleString('en-GB')}
                      </p>
                    </div>
                    {dismissedAlerts.has(alert.id) && (
                      <span className="text-xs text-bloomberg-textMuted">Dismissed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bloomberg-darker border border-bloomberg-border rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-4 border-b border-bloomberg-border flex items-center justify-between">
              <h3 className="font-semibold text-bloomberg-text">
                {showSettingsModal === 'notifications' && 'Notification Preferences'}
                {showSettingsModal === 'display' && 'Display Settings'}
                {showSettingsModal === 'data' && 'Data Refresh Rate'}
                {showSettingsModal === 'export' && 'Export Data'}
                {showSettingsModal === 'integrations' && 'Integrations'}
                {showSettingsModal === 'approvals' && 'Approval Thresholds'}
              </h3>
              <button 
                onClick={() => setShowSettingsModal(null)}
                className="p-1 hover:bg-bloomberg-panel rounded"
              >
                <X className="w-5 h-5 text-bloomberg-textMuted" />
              </button>
            </div>
            <div className="p-4">
              {showSettingsModal === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-bloomberg-panel rounded-lg">
                    <div>
                      <p className="font-medium text-bloomberg-text">Critical Alerts</p>
                      <p className="text-xs text-bloomberg-textMuted">Receive immediate notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-bloomberg-accent" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bloomberg-panel rounded-lg">
                    <div>
                      <p className="font-medium text-bloomberg-text">Warning Alerts</p>
                      <p className="text-xs text-bloomberg-textMuted">Receive daily digest</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-bloomberg-accent" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bloomberg-panel rounded-lg">
                    <div>
                      <p className="font-medium text-bloomberg-text">Email Notifications</p>
                      <p className="text-xs text-bloomberg-textMuted">Send to admin@abbey-os.com</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 accent-bloomberg-accent" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bloomberg-panel rounded-lg">
                    <div>
                      <p className="font-medium text-bloomberg-text">Quiet Hours</p>
                      <p className="text-xs text-bloomberg-textMuted">22:00 - 07:00</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-bloomberg-accent" />
                  </div>
                </div>
              )}

              {showSettingsModal === 'display' && (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-bloomberg-text mb-2">Theme</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 bg-bloomberg-accent/20 border-2 border-bloomberg-accent rounded-lg text-sm text-bloomberg-text">
                        Dark (Bloomberg)
                      </button>
                      <button className="p-3 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-sm text-bloomberg-textMuted">
                        Light
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-bloomberg-text mb-2">Density</p>
                    <select className="w-full p-2 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-bloomberg-text">
                      <option>Comfortable</option>
                      <option>Compact</option>
                      <option>Dense</option>
                    </select>
                  </div>
                </div>
              )}

              {showSettingsModal === 'data' && (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-bloomberg-text mb-2">Auto-refresh Interval</p>
                    <select className="w-full p-2 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-bloomberg-text">
                      <option>Every 5 minutes</option>
                      <option>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                      <option>Every hour</option>
                      <option>Manual only</option>
                    </select>
                  </div>
                  <div className="p-3 bg-bloomberg-panel rounded-lg">
                    <p className="text-sm text-bloomberg-textMuted">Last data refresh</p>
                    <p className="text-bloomberg-text">{new Date().toLocaleString('en-GB')}</p>
                  </div>
                </div>
              )}

              {showSettingsModal === 'export' && (
                <div className="space-y-4">
                  <button className="w-full p-3 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-left hover:border-bloomberg-accent transition-colors">
                    <p className="font-medium text-bloomberg-text">Export Cash Position</p>
                    <p className="text-xs text-bloomberg-textMuted">Download as CSV</p>
                  </button>
                  <button className="w-full p-3 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-left hover:border-bloomberg-accent transition-colors">
                    <p className="font-medium text-bloomberg-text">Export Rent Roll</p>
                    <p className="text-xs text-bloomberg-textMuted">Download as CSV</p>
                  </button>
                  <button className="w-full p-3 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-left hover:border-bloomberg-accent transition-colors">
                    <p className="font-medium text-bloomberg-text">Export Full Report</p>
                    <p className="text-xs text-bloomberg-textMuted">Download as PDF</p>
                  </button>
                </div>
              )}

              {showSettingsModal === 'integrations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-bloomberg-panel rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-blue-500 font-bold">X</span>
                      </div>
                      <div>
                        <p className="font-medium text-bloomberg-text">Xero</p>
                        <p className="text-xs text-bloomberg-textMuted">Accounting</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded">Not Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bloomberg-panel rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Hotel className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-bloomberg-text">Cloudbeds</p>
                        <p className="text-xs text-bloomberg-textMuted">Hotel PMS</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded">Not Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bloomberg-panel rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-bloomberg-text">Square</p>
                        <p className="text-xs text-bloomberg-textMuted">Cafe POS</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded">Not Connected</span>
                  </div>
                  <button className="w-full py-2 text-sm text-bloomberg-accent hover:underline">
                    + Add Integration
                  </button>
                </div>
              )}

              {showSettingsModal === 'approvals' && (
                <div className="space-y-4">
                  <div className="p-3 bg-bloomberg-panel rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-bloomberg-text">Staff</p>
                      <span className="text-sm text-bloomberg-textMuted">Up to £500</span>
                    </div>
                    <input type="range" min="0" max="1000" defaultValue="500" className="w-full accent-bloomberg-accent" />
                  </div>
                  <div className="p-3 bg-bloomberg-panel rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-bloomberg-text">General Manager</p>
                      <span className="text-sm text-bloomberg-textMuted">Up to £5,000</span>
                    </div>
                    <input type="range" min="0" max="10000" defaultValue="5000" className="w-full accent-bloomberg-accent" />
                  </div>
                  <div className="p-3 bg-bloomberg-panel rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-bloomberg-text">Owner</p>
                      <span className="text-sm text-bloomberg-success">Unlimited</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-bloomberg-border">
              <button
                onClick={() => setShowSettingsModal(null)}
                className="w-full py-2 px-4 bg-bloomberg-accent text-white rounded-lg hover:bg-bloomberg-accent/80 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
