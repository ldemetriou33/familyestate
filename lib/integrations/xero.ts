// Abbey OS - Xero Integration
// Connects to Xero for real accounting data

import { prisma } from '@/lib/db'

// Xero API Types
export interface XeroToken {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export interface XeroBankTransaction {
  BankTransactionID: string
  Type: string
  Contact?: { Name: string }
  DateString: string
  Status: string
  LineAmountTypes: string
  Total: number
  Reference?: string
  IsReconciled: boolean
}

export interface XeroInvoice {
  InvoiceID: string
  Type: string
  Contact: { Name: string }
  DateString: string
  DueDateString: string
  Status: string
  Total: number
  AmountDue: number
  AmountPaid: number
  Reference?: string
}

export interface XeroSyncResult {
  success: boolean
  recordsProcessed: number
  recordsCreated: number
  recordsUpdated: number
  recordsFailed: number
  errors: string[]
}

// Xero OAuth URLs
const XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize'
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token'
const XERO_API_URL = 'https://api.xero.com/api.xro/2.0'

/**
 * Generate Xero OAuth authorization URL
 */
export function getXeroAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.XERO_CLIENT_ID
  
  if (!clientId) {
    throw new Error('XERO_CLIENT_ID not configured')
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email accounting.transactions accounting.contacts offline_access',
    state,
  })

  return `${XERO_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeXeroCode(code: string, redirectUri: string): Promise<XeroToken> {
  const clientId = process.env.XERO_CLIENT_ID
  const clientSecret = process.env.XERO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Xero credentials not configured')
  }

  const response = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange Xero code: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Refresh Xero access token
 */
export async function refreshXeroToken(refreshToken: string): Promise<XeroToken> {
  const clientId = process.env.XERO_CLIENT_ID
  const clientSecret = process.env.XERO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Xero credentials not configured')
  }

  const response = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh Xero token: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Xero API Client
 */
export class XeroClient {
  private accessToken: string
  private tenantId: string

  constructor(accessToken: string, tenantId: string) {
    this.accessToken = accessToken
    this.tenantId = tenantId
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${XERO_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'xero-tenant-id': this.tenantId,
        'Accept': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Xero API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get bank transactions
   */
  async getBankTransactions(modifiedAfter?: Date): Promise<XeroBankTransaction[]> {
    let endpoint = '/BankTransactions'
    
    if (modifiedAfter) {
      endpoint += `?where=UpdatedDateUTC>DateTime(${modifiedAfter.toISOString()})`
    }

    const data = await this.request<{ BankTransactions: XeroBankTransaction[] }>(endpoint)
    return data.BankTransactions
  }

  /**
   * Get invoices
   */
  async getInvoices(modifiedAfter?: Date): Promise<XeroInvoice[]> {
    let endpoint = '/Invoices'
    
    if (modifiedAfter) {
      endpoint += `?where=UpdatedDateUTC>DateTime(${modifiedAfter.toISOString()})`
    }

    const data = await this.request<{ Invoices: XeroInvoice[] }>(endpoint)
    return data.Invoices
  }
}

/**
 * Sync bank transactions from Xero
 */
export async function syncXeroBankTransactions(
  connectionId: string
): Promise<XeroSyncResult> {
  const result: XeroSyncResult = {
    success: false,
    recordsProcessed: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    errors: [],
  }

  try {
    // Get connection details
    const connection = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
    })

    if (!connection || !connection.credentials) {
      throw new Error('Integration connection not found or missing credentials')
    }

    const credentials = connection.credentials as { 
      access_token: string
      refresh_token: string
      tenant_id: string
    }

    // Initialize Xero client
    const client = new XeroClient(credentials.access_token, credentials.tenant_id)

    // Get transactions since last sync
    const transactions = await client.getBankTransactions(
      connection.lastSyncAt || undefined
    )

    result.recordsProcessed = transactions.length

    // Process each transaction
    for (const tx of transactions) {
      try {
        // Map Xero transaction to our schema
        const category = categorizeXeroTransaction(tx)
        
        // Check if transaction already exists
        const existing = await prisma.financialTransaction.findFirst({
          where: { externalId: tx.BankTransactionID },
        })

        if (existing) {
          // Update existing
          await prisma.financialTransaction.update({
            where: { id: existing.id },
            data: {
              amount: tx.Total,
              description: tx.Contact?.Name || tx.Reference || 'Xero Transaction',
              reconciliationStatus: tx.IsReconciled ? 'MATCHED' : 'PENDING',
              dataSource: 'XERO',
              lastUpdatedAt: new Date(),
            },
          })
          result.recordsUpdated++
        } else {
          // Create new
          await prisma.financialTransaction.create({
            data: {
              externalId: tx.BankTransactionID,
              date: new Date(tx.DateString),
              amount: tx.Total,
              category,
              description: tx.Contact?.Name || tx.Reference || 'Xero Transaction',
              reference: tx.Reference,
              reconciliationStatus: tx.IsReconciled ? 'MATCHED' : 'PENDING',
              dataSource: 'XERO',
              confidence: 'VERIFIED',
              integrationId: connectionId,
              lastUpdatedAt: new Date(),
            },
          })
          result.recordsCreated++
        }
      } catch (error) {
        result.recordsFailed++
        result.errors.push(`Failed to process tx ${tx.BankTransactionID}: ${error}`)
      }
    }

    // Update connection status
    await prisma.integrationConnection.update({
      where: { id: connectionId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'ACTIVE',
        lastSyncError: null,
      },
    })

    // Log the sync
    await prisma.integrationSyncLog.create({
      data: {
        connectionId,
        startedAt: new Date(),
        completedAt: new Date(),
        recordsProcessed: result.recordsProcessed,
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        recordsFailed: result.recordsFailed,
        status: 'ACTIVE',
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
      },
    })

    result.success = true
  } catch (error) {
    result.errors.push(`Sync failed: ${error}`)
    
    // Update connection with error
    await prisma.integrationConnection.update({
      where: { id: connectionId },
      data: {
        lastSyncStatus: 'ERROR',
        lastSyncError: `${error}`,
      },
    })
  }

  return result
}

/**
 * Categorize Xero transaction based on description/type
 */
function categorizeXeroTransaction(tx: XeroBankTransaction): 'RENT_INCOME' | 'HOTEL_REVENUE' | 'CAFE_REVENUE' | 'MORTGAGE_PAYMENT' | 'UTILITIES' | 'MAINTENANCE' | 'PAYROLL' | 'SUPPLIES' | 'INSURANCE' | 'TAXES' | 'OTHER_INCOME' | 'OTHER_EXPENSE' {
  const description = (tx.Contact?.Name || tx.Reference || '').toLowerCase()
  
  if (description.includes('rent') || description.includes('tenant')) {
    return 'RENT_INCOME'
  }
  if (description.includes('hotel') || description.includes('booking')) {
    return 'HOTEL_REVENUE'
  }
  if (description.includes('cafe') || description.includes('coffee') || description.includes('restaurant')) {
    return 'CAFE_REVENUE'
  }
  if (description.includes('mortgage') || description.includes('loan')) {
    return 'MORTGAGE_PAYMENT'
  }
  if (description.includes('electric') || description.includes('gas') || description.includes('water') || description.includes('utility')) {
    return 'UTILITIES'
  }
  if (description.includes('repair') || description.includes('maintenance') || description.includes('plumber')) {
    return 'MAINTENANCE'
  }
  if (description.includes('salary') || description.includes('wage') || description.includes('payroll')) {
    return 'PAYROLL'
  }
  if (description.includes('insurance')) {
    return 'INSURANCE'
  }
  if (description.includes('hmrc') || description.includes('tax') || description.includes('vat')) {
    return 'TAXES'
  }

  // Default based on transaction type
  return tx.Total >= 0 ? 'OTHER_INCOME' : 'OTHER_EXPENSE'
}

/**
 * Create a new Xero integration connection
 */
export async function createXeroConnection(
  organizationId: string,
  name: string,
  tokens: XeroToken,
  tenantId: string
) {
  return prisma.integrationConnection.create({
    data: {
      organizationId,
      provider: 'XERO',
      name,
      credentials: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        tenant_id: tenantId,
        expires_at: Date.now() + tokens.expires_in * 1000,
      },
      syncFrequency: 'HOURLY',
      isActive: true,
    },
  })
}

/**
 * Get integration status for dashboard
 */
export async function getIntegrationStatus(organizationId: string) {
  const connections = await prisma.integrationConnection.findMany({
    where: { organizationId },
    include: {
      syncLogs: {
        orderBy: { startedAt: 'desc' },
        take: 1,
      },
    },
  })

  return connections.map(conn => ({
    id: conn.id,
    provider: conn.provider,
    name: conn.name,
    status: conn.lastSyncStatus,
    lastSync: conn.lastSyncAt,
    lastError: conn.lastSyncError,
    isActive: conn.isActive,
    lastSyncRecords: conn.syncLogs[0]?.recordsProcessed || 0,
  }))
}

