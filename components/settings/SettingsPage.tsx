'use client'

import { useState } from 'react'
import { 
  X, 
  Sun, 
  Moon, 
  Bell, 
  BellOff, 
  Mail, 
  Clock, 
  Monitor, 
  Download, 
  Link2, 
  Shield, 
  RefreshCw,
  Check,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Zap,
  Database,
  FileText,
  CreditCard,
  Hotel,
  UtensilsCrossed,
  Wallet,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { useTheme, Theme, Density } from '@/contexts/ThemeContext'
import { useIntegrations, IntegrationProvider } from '@/contexts/IntegrationsContext'
import { useApprovals } from '@/contexts/ApprovalsContext'
import { formatGBP } from '@/lib/utils'

interface SettingsPageProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: string
}

const integrationInfo: Record<IntegrationProvider, { 
  name: string
  description: string
  icon: React.ReactNode
  color: string
  features: string[]
}> = {
  xero: {
    name: 'Xero',
    description: 'Accounting & bookkeeping',
    icon: <span className="text-xl font-bold">X</span>,
    color: 'bg-blue-500',
    features: ['Bank transactions', 'Invoices', 'Bills', 'Reports'],
  },
  cloudbeds: {
    name: 'Cloudbeds',
    description: 'Hotel property management',
    icon: <Hotel className="w-5 h-5" />,
    color: 'bg-green-500',
    features: ['Reservations', 'Room inventory', 'Guest data', 'Revenue'],
  },
  square: {
    name: 'Square POS',
    description: 'Point of sale & payments',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    color: 'bg-orange-500',
    features: ['Daily sales', 'Transactions', 'Items sold', 'Tips'],
  },
  stripe: {
    name: 'Stripe',
    description: 'Online payments',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-purple-500',
    features: ['Payments', 'Subscriptions', 'Payouts', 'Disputes'],
  },
  quickbooks: {
    name: 'QuickBooks',
    description: 'Accounting software',
    icon: <Wallet className="w-5 h-5" />,
    color: 'bg-green-600',
    features: ['Transactions', 'Invoices', 'Expenses', 'Payroll'],
  },
  gocardless: {
    name: 'GoCardless',
    description: 'Direct debit payments',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'bg-cyan-500',
    features: ['Rent collection', 'Recurring payments', 'Mandates'],
  },
}

export function SettingsPage({ isOpen, onClose, initialTab = 'appearance' }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const { 
    theme, setTheme, 
    density, setDensity, 
    autoRefreshInterval, setAutoRefreshInterval,
    notifications, setNotifications 
  } = useTheme()
  const { integrations, connectIntegration, disconnectIntegration, syncIntegration, isConnecting } = useIntegrations()
  const { thresholds: approvalThresholds, setThresholds: setApprovalThresholds, pendingApprovals } = useApprovals()

  if (!isOpen) return null

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Sync', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'approvals', label: 'Approvals', icon: Shield },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'account', label: 'Account', icon: User },
  ]

  const handleExport = (type: string) => {
    // Create a simple CSV export
    const now = new Date().toISOString().split('T')[0]
    let content = ''
    let filename = ''

    if (type === 'cash') {
      content = 'Date,Operating Balance,Reserve Balance,Inflows,Outflows\n'
      content += `${now},125000,50000,15000,8000`
      filename = `abbey-os-cash-position-${now}.csv`
    } else if (type === 'rent') {
      content = 'Unit,Tenant,Monthly Rent,Status,Arrears\n'
      content += 'Flat 2A,John Smith,1500,Current,0\n'
      content += 'Flat 3B,Sarah Connor,1350,Overdue,1350\n'
      filename = `abbey-os-rent-roll-${now}.csv`
    } else if (type === 'full') {
      content = 'Abbey OS Full Report\n'
      content += `Generated: ${now}\n\n`
      content += 'Portfolio Overview\n'
      content += 'Total Properties: 14\n'
      content += 'Total Value: £4,500,000\n'
      filename = `abbey-os-full-report-${now}.txt`
    }

    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r border-[var(--border-primary)] p-2 shrink-0 overflow-y-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                          : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50'
                      }`}
                    >
                      <div className="w-full h-24 bg-gray-900 rounded-lg mb-3 flex items-center justify-center">
                        <Moon className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="font-medium text-[var(--text-primary)]">Dark Mode</p>
                      <p className="text-xs text-[var(--text-muted)]">Bloomberg-style dark theme</p>
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'light'
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                          : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50'
                      }`}
                    >
                      <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center border">
                        <Sun className="w-8 h-8 text-amber-500" />
                      </div>
                      <p className="font-medium text-[var(--text-primary)]">Light Mode</p>
                      <p className="text-xs text-[var(--text-muted)]">Clean light theme</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Density</h3>
                  <div className="space-y-2">
                    {(['comfortable', 'compact', 'dense'] as Density[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
                          density === d
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-[var(--text-primary)] capitalize">{d}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {d === 'comfortable' && 'Default spacing for readability'}
                            {d === 'compact' && 'Reduced spacing for more content'}
                            {d === 'dense' && 'Minimal spacing for maximum density'}
                          </p>
                        </div>
                        {density === d && <Check className="w-5 h-5 text-[var(--accent)]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Notification Preferences</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">Critical Alerts</p>
                        <p className="text-xs text-[var(--text-muted)]">Immediate notification for urgent issues</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, criticalAlerts: !notifications.criticalAlerts })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notifications.criticalAlerts ? 'bg-[var(--accent)]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        notifications.criticalAlerts ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Bell className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">Warning Alerts</p>
                        <p className="text-xs text-[var(--text-muted)]">Daily digest of warnings</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, warningAlerts: !notifications.warningAlerts })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notifications.warningAlerts ? 'bg-[var(--accent)]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        notifications.warningAlerts ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">Email Notifications</p>
                        <p className="text-xs text-[var(--text-muted)]">Send alerts to admin@abbey-os.com</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notifications.emailNotifications ? 'bg-[var(--accent)]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        notifications.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <BellOff className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">Quiet Hours</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {notifications.quietStart} - {notifications.quietEnd} (Critical alerts still come through)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, quietHours: !notifications.quietHours })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notifications.quietHours ? 'bg-[var(--accent)]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        notifications.quietHours ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {notifications.quietHours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[var(--text-muted)] mb-1 block">Quiet Start</label>
                      <input
                        type="time"
                        value={notifications.quietStart}
                        onChange={(e) => setNotifications({ ...notifications, quietStart: e.target.value })}
                        className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--text-muted)] mb-1 block">Quiet End</label>
                      <input
                        type="time"
                        value={notifications.quietEnd}
                        onChange={(e) => setNotifications({ ...notifications, quietEnd: e.target.value })}
                        className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data & Sync Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Data Refresh Settings</h3>
                
                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-2 block">Auto-refresh Interval</label>
                  <div className="space-y-2">
                    {[
                      { value: 60000, label: 'Every 1 minute' },
                      { value: 300000, label: 'Every 5 minutes' },
                      { value: 900000, label: 'Every 15 minutes' },
                      { value: 1800000, label: 'Every 30 minutes' },
                      { value: 3600000, label: 'Every hour' },
                      { value: 0, label: 'Manual only' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAutoRefreshInterval(opt.value)}
                        className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
                          autoRefreshInterval === opt.value
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50'
                        }`}
                      >
                        <span className="text-[var(--text-primary)]">{opt.label}</span>
                        {autoRefreshInterval === opt.value && <Check className="w-5 h-5 text-[var(--accent)]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Last Data Refresh</p>
                      <p className="text-sm text-[var(--text-muted)]">{new Date().toLocaleString('en-GB')}</p>
                    </div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Connected Integrations</h3>
                  <span className="text-sm text-[var(--text-muted)]">
                    {integrations.filter(i => i.status === 'connected').length} of {integrations.length} connected
                  </span>
                </div>

                <div className="space-y-3">
                  {integrations.map(integration => {
                    const info = integrationInfo[integration.provider]
                    const isLoading = isConnecting === integration.provider || integration.status === 'syncing'

                    return (
                      <div
                        key={integration.id}
                        className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center text-white`}>
                              {info.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">{info.name}</p>
                              <p className="text-sm text-[var(--text-muted)]">{info.description}</p>
                              {integration.status === 'connected' && integration.email && (
                                <p className="text-xs text-[var(--accent)] mt-1">{integration.email}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.status === 'connected' || integration.status === 'syncing' ? (
                              <>
                                <button
                                  onClick={() => syncIntegration(integration.id)}
                                  disabled={isLoading || integration.status === 'syncing'}
                                  className="p-2 bg-[var(--bg-primary)] rounded-lg hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-50"
                                  title="Sync now"
                                >
                                  <RefreshCw className={`w-4 h-4 text-[var(--accent)] ${integration.status === 'syncing' ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                  onClick={() => disconnectIntegration(integration.id)}
                                  className="px-3 py-1.5 text-sm text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                  Disconnect
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => connectIntegration(integration.provider)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    <Link2 className="w-4 h-4" />
                                    Connect
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {info.features.map(feature => (
                            <span
                              key={feature}
                              className="text-xs px-2 py-1 bg-[var(--bg-primary)] rounded text-[var(--text-muted)]"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Last sync info */}
                        {integration.status === 'connected' && integration.lastSync && (
                          <p className="text-xs text-[var(--text-muted)] mt-3">
                            Last synced: {integration.lastSync.toLocaleString('en-GB')}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Approval Thresholds</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Set spending limits for each role. Expenses above these limits require higher approval.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">Staff</p>
                        <p className="text-xs text-[var(--text-muted)]">Can approve up to:</p>
                      </div>
                      <span className="text-lg font-bold text-[var(--accent)]">{formatGBP(approvalThresholds.staff)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      value={approvalThresholds.staff}
                      onChange={(e) => setApprovalThresholds({ ...approvalThresholds, staff: parseInt(e.target.value), owner: Infinity })}
                      className="w-full accent-[var(--accent)]"
                    />
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                      <span>£0</span>
                      <span>£2,000</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">General Manager</p>
                        <p className="text-xs text-[var(--text-muted)]">Can approve up to:</p>
                      </div>
                      <span className="text-lg font-bold text-[var(--accent)]">{formatGBP(approvalThresholds.gm)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="500"
                      value={approvalThresholds.gm}
                      onChange={(e) => setApprovalThresholds({ ...approvalThresholds, gm: parseInt(e.target.value), owner: Infinity })}
                      className="w-full accent-[var(--accent)]"
                    />
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                      <span>£0</span>
                      <span>£20,000</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">Owner</p>
                        <p className="text-xs text-[var(--text-muted)]">Can approve:</p>
                      </div>
                      <span className="text-lg font-bold text-green-500">Unlimited</span>
                    </div>
                  </div>
                </div>

                {/* Pending Approvals */}
                {pendingApprovals.filter(a => a.status === 'pending').length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[var(--warning)]" />
                      Pending Approvals ({pendingApprovals.filter(a => a.status === 'pending').length})
                    </h4>
                    <div className="space-y-2">
                      {pendingApprovals.filter(a => a.status === 'pending').slice(0, 3).map(approval => (
                        <div key={approval.id} className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{approval.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {formatGBP(approval.amount)} • Requires {approval.requiredRole.toUpperCase()} approval
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              approval.requiredRole === 'owner' ? 'bg-red-500/10 text-red-500' :
                              approval.requiredRole === 'gm' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-green-500/10 text-green-500'
                            }`}>
                              {approval.requiredRole}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Export Data</h3>

                <div className="space-y-3">
                  <button
                    onClick={() => handleExport('cash')}
                    className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Wallet className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[var(--text-primary)]">Export Cash Position</p>
                        <p className="text-xs text-[var(--text-muted)]">Download as CSV</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                  </button>

                  <button
                    onClick={() => handleExport('rent')}
                    className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[var(--text-primary)]">Export Rent Roll</p>
                        <p className="text-xs text-[var(--text-muted)]">Download as CSV</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                  </button>

                  <button
                    onClick={() => handleExport('full')}
                    className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Database className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[var(--text-primary)]">Export Full Report</p>
                        <p className="text-xs text-[var(--text-muted)]">Complete portfolio report</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                  </button>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Account</h3>

                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg flex items-center gap-4">
                  <div className="w-16 h-16 bg-[var(--accent)]/20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Estate Manager</p>
                    <p className="text-sm text-[var(--text-muted)]">admin@abbey-os.com</p>
                    <p className="text-xs text-[var(--accent)] mt-1">Owner Role</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-all flex items-center justify-between">
                    <span className="text-[var(--text-primary)]">Change Password</span>
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                  <button className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-all flex items-center justify-between">
                    <span className="text-[var(--text-primary)]">Two-Factor Authentication</span>
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                  <button className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-all flex items-center justify-between">
                    <span className="text-[var(--text-primary)]">API Keys</span>
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>

                <button className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-red-500">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

