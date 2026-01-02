'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Integration types
export type IntegrationProvider = 
  | 'xero' 
  | 'cloudbeds' 
  | 'square' 
  | 'stripe' 
  | 'quickbooks'
  | 'gocardless'

export interface Integration {
  id: string
  provider: IntegrationProvider
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: Date | null
  connectedAt: Date | null
  email?: string
  error?: string
}

interface IntegrationsContextType {
  integrations: Integration[]
  connectIntegration: (provider: IntegrationProvider) => Promise<void>
  disconnectIntegration: (id: string) => Promise<void>
  syncIntegration: (id: string) => Promise<void>
  isConnecting: IntegrationProvider | null
}

const defaultIntegrations: Integration[] = [
  {
    id: 'xero-1',
    provider: 'xero',
    name: 'Xero',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
  },
  {
    id: 'cloudbeds-1',
    provider: 'cloudbeds',
    name: 'Cloudbeds',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
  },
  {
    id: 'square-1',
    provider: 'square',
    name: 'Square POS',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
  },
  {
    id: 'stripe-1',
    provider: 'stripe',
    name: 'Stripe',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
  },
  {
    id: 'gocardless-1',
    provider: 'gocardless',
    name: 'GoCardless',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
  },
]

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined)

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations)
  const [isConnecting, setIsConnecting] = useState<IntegrationProvider | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('abbey-integrations')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Convert date strings back to Date objects
      const withDates = parsed.map((i: Integration) => ({
        ...i,
        lastSync: i.lastSync ? new Date(i.lastSync) : null,
        connectedAt: i.connectedAt ? new Date(i.connectedAt) : null,
      }))
      setIntegrations(withDates)
    }
  }, [])

  // Save to localStorage when integrations change
  useEffect(() => {
    localStorage.setItem('abbey-integrations', JSON.stringify(integrations))
  }, [integrations])

  const connectIntegration = async (provider: IntegrationProvider) => {
    setIsConnecting(provider)
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIntegrations(prev => prev.map(i => {
      if (i.provider === provider) {
        return {
          ...i,
          status: 'connected' as const,
          connectedAt: new Date(),
          email: `account@${provider}.com`,
        }
      }
      return i
    }))
    
    setIsConnecting(null)
  }

  const disconnectIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: 'disconnected' as const,
          lastSync: null,
          connectedAt: null,
          email: undefined,
        }
      }
      return i
    }))
  }

  const syncIntegration = async (id: string) => {
    // Set syncing status
    setIntegrations(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, status: 'syncing' as const }
      }
      return i
    }))

    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Update with sync result
    setIntegrations(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: 'connected' as const,
          lastSync: new Date(),
        }
      }
      return i
    }))
  }

  return (
    <IntegrationsContext.Provider value={{
      integrations,
      connectIntegration,
      disconnectIntegration,
      syncIntegration,
      isConnecting,
    }}>
      {children}
    </IntegrationsContext.Provider>
  )
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext)
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider')
  }
  return context
}

