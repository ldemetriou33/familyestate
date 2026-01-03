/**
 * Xero Sync Cron Job
 * Runs daily to fetch latest financial data from Xero
 */

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { runXeroSync } from '@/lib/sync/xero'

// Verify this is called by Vercel Cron (or allow in development)
const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  // Verify authorization in production
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}` && CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  console.log('Xero sync cron job triggered')
  
  try {
    const result = await runXeroSync()
    
    return NextResponse.json({
      status: result.success ? 'success' : 'partial',
      timestamp: new Date().toISOString(),
      results: result.results,
    })
  } catch (error) {
    console.error('Xero sync cron error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

// Allow manual trigger via POST for testing
export async function POST(request: NextRequest) {
  return GET(request)
}

