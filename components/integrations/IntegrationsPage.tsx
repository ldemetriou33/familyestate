'use client'

import { useState } from 'react'
import { 
  Link2, 
  RefreshCw, 
  Check, 
  X, 
  ExternalLink, 
  AlertCircle,
  Hotel,
  UtensilsCrossed,
  CreditCard,
  Wallet,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useIntegrations, IntegrationProvider, Integration } from '@/contexts/IntegrationsContext'

interface IntegrationsPageProps {
  isOpen: boolean
  onClose: () => void
}

const integrationDetails: Record<IntegrationProvider, {
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  website: string
  features: { name: string; description: string }[]
  setupSteps: string[]
}> = {
  xero: {
    name: 'Xero',
    description: 'Cloud-based accounting software for small businesses',
    icon: <span className="text-2xl font-bold">X</span>,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    website: 'https://xero.com',
    features: [
      { name: 'Bank Transactions', description: 'Sync bank feeds and transactions automatically' },
      { name: 'Invoices', description: 'Pull sales invoices and payment status' },
      { name: 'Bills', description: 'Track expenses and supplier payments' },
      { name: 'Financial Reports', description: 'P&L, Balance Sheet, Cash Flow' },
    ],
    setupSteps: [
      'Click Connect to open Xero authorization',
      'Log in with your Xero credentials',
      'Select the organization to connect',
      'Grant Abbey OS access permissions',
      'Data will sync automatically every hour',
    ],
  },
  cloudbeds: {
    name: 'Cloudbeds',
    description: 'Hotel property management system (PMS)',
    icon: <Hotel className="w-6 h-6" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    website: 'https://cloudbeds.com',
    features: [
      { name: 'Reservations', description: 'Real-time booking data and guest info' },
      { name: 'Room Inventory', description: 'Availability and room status' },
      { name: 'Revenue Data', description: 'ADR, RevPAR, and occupancy metrics' },
      { name: 'Channel Manager', description: 'OTA booking source tracking' },
    ],
    setupSteps: [
      'Click Connect to open Cloudbeds authorization',
      'Sign in to your Cloudbeds account',
      'Select the property to connect',
      'Authorize Abbey OS integration',
      'PMS data will sync every 15 minutes',
    ],
  },
  square: {
    name: 'Square POS',
    description: 'Point of sale and payment processing for F&B',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    website: 'https://squareup.com',
    features: [
      { name: 'Daily Sales', description: 'Gross and net sales data' },
      { name: 'Transactions', description: 'Individual transaction details' },
      { name: 'Items Sold', description: 'Menu item performance tracking' },
      { name: 'Tips & Gratuities', description: 'Staff tip tracking' },
    ],
    setupSteps: [
      'Click Connect to open Square authorization',
      'Log in to your Square account',
      'Select the location to connect',
      'Approve Abbey OS access',
      'Sales data syncs every hour',
    ],
  },
  stripe: {
    name: 'Stripe',
    description: 'Online payments and subscriptions',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    website: 'https://stripe.com',
    features: [
      { name: 'Payments', description: 'Online payment transactions' },
      { name: 'Subscriptions', description: 'Recurring billing management' },
      { name: 'Payouts', description: 'Bank transfer tracking' },
      { name: 'Disputes', description: 'Chargeback monitoring' },
    ],
    setupSteps: [
      'Click Connect to open Stripe Connect',
      'Sign in to Stripe Dashboard',
      'Authorize Abbey OS integration',
      'Payment data syncs in real-time',
    ],
  },
  quickbooks: {
    name: 'QuickBooks',
    description: 'Accounting and bookkeeping software',
    icon: <Wallet className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-600',
    website: 'https://quickbooks.intuit.com',
    features: [
      { name: 'Transactions', description: 'Bank and credit card feeds' },
      { name: 'Invoices', description: 'Customer invoicing and payments' },
      { name: 'Expenses', description: 'Expense categorization' },
      { name: 'Payroll', description: 'Staff payroll data' },
    ],
    setupSteps: [
      'Click Connect to open Intuit OAuth',
      'Sign in to your QuickBooks account',
      'Select the company file',
      'Grant Abbey OS read permissions',
      'Data syncs every 30 minutes',
    ],
  },
  gocardless: {
    name: 'GoCardless',
    description: 'Direct debit payment collection',
    icon: <RefreshCw className="w-6 h-6" />,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500',
    website: 'https://gocardless.com',
    features: [
      { name: 'Rent Collection', description: 'Automated rent payments' },
      { name: 'Recurring Payments', description: 'Monthly direct debits' },
      { name: 'Mandates', description: 'Direct debit mandate status' },
      { name: 'Failed Payments', description: 'Payment failure alerts' },
    ],
    setupSteps: [
      'Click Connect to open GoCardless',
      'Sign in to your account',
      'Authorize Abbey OS access',
      'Payment data syncs daily',
    ],
  },
}

export function IntegrationsPage({ isOpen, onClose }: IntegrationsPageProps) {
  const { integrations, connectIntegration, disconnectIntegration, syncIntegration, isConnecting } = useIntegrations()
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationProvider | null>(null)
  const [showConnectFlow, setShowConnectFlow] = useState(false)
  const [connectStep, setConnectStep] = useState(0)

  if (!isOpen) return null

  const selectedDetails = selectedIntegration ? integrationDetails[selectedIntegration] : null
  const selectedIntegrationData = selectedIntegration 
    ? integrations.find(i => i.provider === selectedIntegration) 
    : null

  const handleConnect = async () => {
    if (!selectedIntegration) return
    
    setShowConnectFlow(true)
    setConnectStep(0)
    
    // Simulate going through steps
    for (let i = 0; i < (selectedDetails?.setupSteps.length || 4); i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConnectStep(i + 1)
    }
    
    await connectIntegration(selectedIntegration)
    setShowConnectFlow(false)
  }

  const handleSync = async () => {
    if (!selectedIntegrationData) return
    await syncIntegration(selectedIntegrationData.id)
  }

  const handleDisconnect = async () => {
    if (!selectedIntegrationData) return
    await disconnectIntegration(selectedIntegrationData.id)
    setSelectedIntegration(null)
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6 text-[var(--accent)]" />
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Integrations</h2>
              <p className="text-sm text-[var(--text-muted)]">{connectedCount} of {integrations.length} connected</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Integration List */}
          <div className="w-80 border-r border-[var(--border-primary)] overflow-y-auto">
            <div className="p-4 space-y-2">
              {integrations.map(integration => {
                const details = integrationDetails[integration.provider]
                const isSelected = selectedIntegration === integration.provider
                
                return (
                  <button
                    key={integration.id}
                    onClick={() => setSelectedIntegration(integration.provider)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                        : 'border-[var(--border-primary)] hover:border-[var(--accent)]/50 bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${details.bgColor} rounded-xl flex items-center justify-center text-white`}>
                        {details.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[var(--text-primary)]">{details.name}</p>
                          {integration.status === 'connected' ? (
                            <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                          ) : integration.status === 'syncing' ? (
                            <RefreshCw className="w-5 h-5 text-[var(--accent)] animate-spin" />
                          ) : integration.status === 'error' ? (
                            <XCircle className="w-5 h-5 text-[var(--danger)]" />
                          ) : null}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] truncate">{details.description}</p>
                        {integration.status === 'connected' && integration.lastSync && (
                          <p className="text-xs text-[var(--success)] mt-1">
                            Last sync: {integration.lastSync.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Integration Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedIntegration && selectedDetails ? (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${selectedDetails.bgColor} rounded-2xl flex items-center justify-center text-white`}>
                      {selectedDetails.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)]">{selectedDetails.name}</h3>
                      <p className="text-[var(--text-muted)]">{selectedDetails.description}</p>
                      <a 
                        href={selectedDetails.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1 mt-1"
                      >
                        Visit website <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  {/* Connection Status & Actions */}
                  <div className="flex items-center gap-3">
                    {selectedIntegrationData?.status === 'connected' || selectedIntegrationData?.status === 'syncing' ? (
                      <>
                        <button
                          onClick={handleSync}
                          disabled={selectedIntegrationData.status === 'syncing'}
                          className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${selectedIntegrationData.status === 'syncing' ? 'animate-spin' : ''}`} />
                          Sync Now
                        </button>
                        <button
                          onClick={handleDisconnect}
                          className="px-4 py-2 text-[var(--danger)] bg-[var(--danger-bg)] border border-[var(--danger)]/20 rounded-lg hover:bg-[var(--danger)]/20 transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnect}
                        disabled={isConnecting === selectedIntegration}
                        className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isConnecting === selectedIntegration ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4" />
                            Connect {selectedDetails.name}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Connection Info */}
                {selectedIntegrationData?.status === 'connected' && (
                  <div className="p-4 bg-[var(--success-bg)] border border-[var(--success)]/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                      <div>
                        <p className="font-medium text-[var(--success)]">Connected</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {selectedIntegrationData.email && `Account: ${selectedIntegrationData.email} • `}
                          Connected {selectedIntegrationData.connectedAt?.toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[var(--accent)]" />
                    What This Integration Does
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDetails.features.map(feature => (
                      <div key={feature.name} className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
                        <p className="font-medium text-[var(--text-primary)]">{feature.name}</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup Steps */}
                {selectedIntegrationData?.status !== 'connected' && (
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[var(--accent)]" />
                      How to Connect
                    </h4>
                    <div className="space-y-3">
                      {selectedDetails.setupSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            showConnectFlow && connectStep > index
                              ? 'bg-[var(--success)] text-white'
                              : showConnectFlow && connectStep === index
                              ? 'bg-[var(--accent)] text-white'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-primary)]'
                          }`}>
                            {showConnectFlow && connectStep > index ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <p className={`text-sm ${
                            showConnectFlow && connectStep === index
                              ? 'text-[var(--text-primary)] font-medium'
                              : 'text-[var(--text-muted)]'
                          }`}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Security */}
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[var(--accent)] mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Secure Connection</p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        Abbey OS uses OAuth 2.0 for secure authentication. We never store your {selectedDetails.name} password. 
                        You can revoke access at any time from your {selectedDetails.name} account settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <Link2 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Select an Integration</h3>
                  <p className="text-[var(--text-muted)] max-w-md">
                    Choose an integration from the list to view details, connect your accounts, and sync data automatically.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationsPage

