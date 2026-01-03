/**
 * Xero Sync - Scheduled Poller
 * Fetches Profit & Loss reports and Cash at Bank figures
 * Runs daily via Vercel Cron
 */

import { prisma } from '@/lib/prisma'
import { DataSource, DataConfidence } from '@prisma/client'

// Xero API Configuration
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID || ''
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET || ''
const XERO_TENANT_ID = process.env.XERO_TENANT_ID || ''

interface XeroTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

interface XeroProfitAndLossReport {
  Reports: Array<{
    ReportName: string
    ReportDate: string
    Rows: Array<{
      RowType: string
      Title?: string
      Rows?: Array<{
        RowType: string
        Cells: Array<{
          Value: string
          Attributes?: Array<{
            Value: string
            Id: string
          }>
        }>
      }>
    }>
  }>
}

interface XeroBalanceSheet {
  Reports: Array<{
    Rows: Array<{
      RowType: string
      Title?: string
      Rows?: Array<{
        Cells: Array<{
          Value: string
        }>
      }>
    }>
  }>
}

interface XeroBankAccounts {
  Accounts: Array<{
    AccountID: string
    Name: string
    Type: string
    BankAccountNumber?: string
    CurrencyCode: string
  }>
}

interface XeroBankStatement {
  BankStatement: {
    BankAccountID: string
    EndingBalance: number
    Lines: Array<{
      Date: string
      Description: string
      Amount: number
      Balance: number
    }>
  }
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

async function getStoredTokens(): Promise<XeroTokens | null> {
  const integration = await prisma.integrationConnection.findFirst({
    where: { provider: 'XERO', isActive: true },
  })
  
  if (!integration?.credentials) return null
  
  const config = integration.credentials as Record<string, unknown>
  return {
    access_token: config.access_token as string,
    refresh_token: config.refresh_token as string,
    expires_at: config.expires_at as number,
  }
}

async function refreshTokens(refreshToken: string): Promise<XeroTokens | null> {
  try {
    const response = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    
    if (!response.ok) {
      console.error('Failed to refresh Xero tokens:', await response.text())
      return null
    }
    
    const data = await response.json()
    
    const newTokens: XeroTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
    }
    
    // Store the new tokens
    await prisma.integrationConnection.updateMany({
      where: { provider: 'XERO', isActive: true },
      data: {
        credentials: newTokens as object,
        lastSyncAt: new Date(),
      },
    })
    
    return newTokens
  } catch (error) {
    console.error('Error refreshing Xero tokens:', error)
    return null
  }
}

async function getValidAccessToken(): Promise<string | null> {
  let tokens = await getStoredTokens()
  
  if (!tokens) {
    console.error('No Xero tokens found. Please connect Xero integration first.')
    return null
  }
  
  // Refresh if expired or expiring soon (within 5 minutes)
  if (tokens.expires_at < Date.now() + 5 * 60 * 1000) {
    tokens = await refreshTokens(tokens.refresh_token)
    if (!tokens) return null
  }
  
  return tokens.access_token
}

// ============================================
// XERO API CALLS
// ============================================

async function xeroApiRequest<T>(endpoint: string): Promise<T | null> {
  const accessToken = await getValidAccessToken()
  if (!accessToken) return null
  
  try {
    const response = await fetch(`https://api.xero.com/api.xro/2.0${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Xero-Tenant-Id': XERO_TENANT_ID,
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error(`Xero API error (${endpoint}):`, await response.text())
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error calling Xero API (${endpoint}):`, error)
    return null
  }
}

// ============================================
// SYNC FUNCTIONS
// ============================================

export async function syncXeroProfitAndLoss(): Promise<{
  success: boolean
  revenue?: number
  expenses?: number
  netProfit?: number
}> {
  console.log('Starting Xero Profit & Loss sync...')
  
  // Get P&L for last month
  const today = new Date()
  const fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const toDate = new Date(today.getFullYear(), today.getMonth(), 0)
  
  const fromDateStr = fromDate.toISOString().split('T')[0]
  const toDateStr = toDate.toISOString().split('T')[0]
  
  const report = await xeroApiRequest<XeroProfitAndLossReport>(
    `/Reports/ProfitAndLoss?fromDate=${fromDateStr}&toDate=${toDateStr}`
  )
  
  if (!report?.Reports?.[0]) {
    return { success: false }
  }
  
  // Parse the P&L report
  let totalRevenue = 0
  let totalExpenses = 0
  
  for (const section of report.Reports[0].Rows) {
    if (section.Title === 'Income' || section.Title === 'Revenue') {
      for (const row of section.Rows || []) {
        const value = parseFloat(row.Cells?.[1]?.Value || '0')
        if (!isNaN(value)) totalRevenue += value
      }
    }
    
    if (section.Title === 'Less Operating Expenses' || section.Title === 'Expenses') {
      for (const row of section.Rows || []) {
        const value = parseFloat(row.Cells?.[1]?.Value || '0')
        if (!isNaN(value)) totalExpenses += value
      }
    }
  }
  
  const netProfit = totalRevenue - totalExpenses
  
  console.log(`Xero P&L: Revenue £${totalRevenue}, Expenses £${totalExpenses}, Net £${netProfit}`)
  
  return {
    success: true,
    revenue: totalRevenue,
    expenses: totalExpenses,
    netProfit,
  }
}

export async function syncXeroCashAtBank(): Promise<{
  success: boolean
  cashAtBank?: number
  accounts?: Array<{ name: string; balance: number }>
}> {
  console.log('Starting Xero Cash at Bank sync...')
  
  // Get bank accounts
  const accountsData = await xeroApiRequest<XeroBankAccounts>(
    '/Accounts?where=Type=="BANK"'
  )
  
  if (!accountsData?.Accounts?.length) {
    return { success: false }
  }
  
  const accounts: Array<{ name: string; balance: number }> = []
  let totalCash = 0
  
  // Get balance for each bank account
  for (const account of accountsData.Accounts) {
    const statement = await xeroApiRequest<XeroBankStatement>(
      `/Reports/BankStatement?bankAccountID=${account.AccountID}`
    )
    
    const balance = statement?.BankStatement?.EndingBalance || 0
    accounts.push({
      name: account.Name,
      balance,
    })
    totalCash += balance
  }
  
  // Update CashPosition in database
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  await prisma.cashPosition.upsert({
    where: {
      date: today,
    },
    create: {
      date: today,
      operatingBalance: totalCash,
      reserveBalance: 0,
      dataSource: DataSource.BANK_FEED,
      confidence: DataConfidence.HIGH,
      lastUpdatedAt: new Date(),
    },
    update: {
      operatingBalance: totalCash,
      dataSource: DataSource.BANK_FEED,
      confidence: DataConfidence.HIGH,
      lastUpdatedAt: new Date(),
    },
  })
  
  console.log(`Xero Cash at Bank: £${totalCash}`)
  
  return {
    success: true,
    cashAtBank: totalCash,
    accounts,
  }
}

export async function syncXeroTransactions(): Promise<{
  success: boolean
  transactionsProcessed: number
}> {
  console.log('Starting Xero transactions sync...')
  
  // Get bank transactions for last 24 hours
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const fromDate = yesterday.toISOString().split('T')[0]
  
  const transactions = await xeroApiRequest<{
    BankTransactions: Array<{
      BankTransactionID: string
      Type: string
      Date: string
      Total: number
      Contact?: { Name: string }
      LineItems: Array<{ Description: string; LineAmount: number }>
    }>
  }>(`/BankTransactions?where=Date>DateTime(${fromDate})`)
  
  if (!transactions?.BankTransactions) {
    return { success: false, transactionsProcessed: 0 }
  }
  
  let processed = 0
  
  for (const tx of transactions.BankTransactions) {
    // Create or update financial transaction
    const isIncome = tx.Type.includes('RECEIVE')
    await prisma.financialTransaction.upsert({
      where: {
        id: tx.BankTransactionID,
      },
      create: {
        id: tx.BankTransactionID,
        date: new Date(tx.Date),
        description: tx.LineItems?.[0]?.Description || tx.Type,
        amount: tx.Total,
        type: isIncome ? 'INCOME' : 'EXPENSE',
        category: isIncome ? 'OTHER_INCOME' : 'OTHER_EXPENSE',
        vendor: tx.Contact?.Name,
        dataSource: DataSource.BANK_FEED,
        confidence: DataConfidence.HIGH,
        lastUpdatedAt: new Date(),
      },
      update: {
        amount: tx.Total,
        description: tx.LineItems?.[0]?.Description || tx.Type,
        vendor: tx.Contact?.Name,
        lastUpdatedAt: new Date(),
      },
    })
    processed++
  }
  
  console.log(`Xero transactions processed: ${processed}`)
  
  return {
    success: true,
    transactionsProcessed: processed,
  }
}

// ============================================
// MAIN SYNC FUNCTION (Called by Cron)
// ============================================

export async function runXeroSync(): Promise<{
  success: boolean
  results: {
    profitAndLoss: Awaited<ReturnType<typeof syncXeroProfitAndLoss>>
    cashAtBank: Awaited<ReturnType<typeof syncXeroCashAtBank>>
    transactions: Awaited<ReturnType<typeof syncXeroTransactions>>
  }
}> {
  console.log('=== Starting Full Xero Sync ===')
  const startTime = Date.now()
  
  // Check if Xero is connected
  const tokens = await getStoredTokens()
  if (!tokens) {
    console.log('Xero not connected, skipping sync')
    return {
      success: false,
      results: {
        profitAndLoss: { success: false },
        cashAtBank: { success: false },
        transactions: { success: false, transactionsProcessed: 0 },
      },
    }
  }
  
  // Run all syncs
  const [profitAndLoss, cashAtBank, transactions] = await Promise.all([
    syncXeroProfitAndLoss(),
    syncXeroCashAtBank(),
    syncXeroTransactions(),
  ])
  
  // Update integration connection status
  await prisma.integrationConnection.updateMany({
    where: { provider: 'XERO', isActive: true },
    data: {
      lastSyncAt: new Date(),
    },
  })
  
  // Log sync
  await prisma.integrationSyncLog.create({
    data: {
      connectionId: (await prisma.integrationConnection.findFirst({
        where: { provider: 'XERO' },
      }))?.id || 'unknown',
      syncType: 'FULL_SYNC',
      status: 'SUCCESS',
      recordsProcessed: transactions.transactionsProcessed,
      details: {
        profitAndLoss,
        cashAtBank,
        transactions,
        durationMs: Date.now() - startTime,
      },
    },
  })
  
  console.log(`=== Xero Sync Complete (${Date.now() - startTime}ms) ===`)
  
  return {
    success: true,
    results: {
      profitAndLoss,
      cashAtBank,
      transactions,
    },
  }
}

