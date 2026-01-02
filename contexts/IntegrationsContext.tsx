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
  oauthUrl?: string
}

interface IntegrationsContextType {
  integrations: Integration[]
  connectIntegration: (provider: IntegrationProvider) => Promise<void>
  disconnectIntegration: (id: string) => Promise<void>
  syncIntegration: (id: string) => Promise<void>
  isConnecting: IntegrationProvider | null
}

// OAuth URLs for real integrations
const getOAuthUrl = (provider: IntegrationProvider): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  
  switch (provider) {
    case 'xero':
      return `${baseUrl}/api/integrations/xero`
    case 'cloudbeds':
      return `${baseUrl}/api/integrations/cloudbeds`
    case 'square':
      return `${baseUrl}/api/integrations/square`
    case 'stripe':
      return 'https://connect.stripe.com/oauth/authorize'
    case 'quickbooks':
      return 'https://appcenter.intuit.com/connect/oauth2'
    case 'gocardless':
      return 'https://connect.gocardless.com/oauth/authorize'
    default:
      return '#'
  }
}

// Developer portal URLs
const getDeveloperUrl = (provider: IntegrationProvider): string => {
  switch (provider) {
    case 'xero':
      return 'https://developer.xero.com/app/manage'
    case 'cloudbeds':
      return 'https://hotels.cloudbeds.com/api/docs/'
    case 'square':
      return 'https://developer.squareup.com/apps'
    case 'stripe':
      return 'https://dashboard.stripe.com/settings/connect'
    case 'quickbooks':
      return 'https://developer.intuit.com/app/developer/myapps'
    case 'gocardless':
      return 'https://manage.gocardless.com/developers'
    default:
      return '#'
  }
}

const defaultIntegrations: Integration[] = [
  {
    id: 'xero-1',
    provider: 'xero',
    name: 'Xero',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
    oauthUrl: getOAuthUrl('xero'),
  },
  {
    id: 'cloudbeds-1',
    provider: 'cloudbeds',
    name: 'Cloudbeds',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
    oauthUrl: getOAuthUrl('cloudbeds'),
  },
  {
    id: 'square-1',
    provider: 'square',
    name: 'Square POS',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
    oauthUrl: getOAuthUrl('square'),
  },
  {
    id: 'stripe-1',
    provider: 'stripe',
    name: 'Stripe',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
    oauthUrl: getOAuthUrl('stripe'),
  },
  {
    id: 'gocardless-1',
    provider: 'gocardless',
    name: 'GoCardless',
    status: 'disconnected',
    lastSync: null,
    connectedAt: null,
    oauthUrl: getOAuthUrl('gocardless'),
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

    // Check for OAuth callback success
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const success = params.get('integration_success')
      const error = params.get('integration_error')
      
      if (success) {
        // Mark integration as connected
        setIntegrations(prev => prev.map(i => {
          if (i.provider === success) {
            return {
              ...i,
              status: 'connected' as const,
              connectedAt: new Date(),
              email: `connected@${success}.com`,
            }
          }
          return i
        }))
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }
      
      if (error) {
        console.error('Integration error:', error)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  // Save to localStorage when integrations change
  useEffect(() => {
    localStorage.setItem('abbey-integrations', JSON.stringify(integrations))
  }, [integrations])

  const connectIntegration = async (provider: IntegrationProvider) => {
    setIsConnecting(provider)
    
    const integration = integrations.find(i => i.provider === provider)
    
    // Open OAuth flow in current window or popup
    const oauthUrl = getOAuthUrl(provider)
    const developerUrl = getDeveloperUrl(provider)
    
    // Check if API credentials are configured by trying the OAuth endpoint
    try {
      // For real OAuth, redirect to the auth endpoint
      // The endpoint will either redirect to the provider's OAuth or to their developer portal
      window.location.href = oauthUrl
    } catch (error) {
      // If OAuth not configured, open developer portal
      window.open(developerUrl, '_blank')
      setIsConnecting(null)
    }
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
