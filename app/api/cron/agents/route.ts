/**
 * ABBEY OS - Multi-Agent Cron Endpoint
 * 
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [
 *     { "path": "/api/cron/agents?schedule=morning", "schedule": "0 9 * * *" },
 *     { "path": "/api/cron/agents?schedule=early", "schedule": "0 6 * * *" },
 *     { "path": "/api/cron/agents?schedule=hourly", "schedule": "0 * * * *" },
 *     { "path": "/api/cron/agents?schedule=evening", "schedule": "0 18 * * *" }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { orchestrator } from '@/lib/agents'

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  
  // In development, allow without secret
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // Vercel sends this header for cron jobs
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true
  }
  
  return false
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const schedule = searchParams.get('schedule') || 'all'
  const agentId = searchParams.get('agent')

  console.log(`[Cron] Received request: schedule=${schedule}, agent=${agentId}`)

  try {
    let result

    // If specific agent requested, run only that one
    if (agentId) {
      const agentResult = await orchestrator.runAgent(agentId, 'cron')
      if (!agentResult) {
        return NextResponse.json(
          { error: `Agent not found: ${agentId}` },
          { status: 404 }
        )
      }
      result = {
        runId: crypto.randomUUID(),
        triggeredBy: 'cron',
        schedule,
        agents: [agentResult],
        totalActionsQueued: agentResult.actionsQueued,
        totalActionsExecuted: agentResult.actionsExecuted,
      }
    } else {
      // Run based on schedule
      switch (schedule) {
        case 'morning':
          // 9 AM - Arrears check
          result = await orchestrator.morningRun()
          break
        
        case 'early':
          // 6 AM - Pricing/Occupancy check
          result = await orchestrator.earlyMorningRun()
          break
        
        case 'hourly':
          // Every hour - Maintenance check
          result = await orchestrator.hourlyRun()
          break
        
        case 'evening':
          // 6 PM - End of day summary
          result = await orchestrator.endOfDayRun()
          break
        
        case 'all':
        default:
          // Run all agents
          result = await orchestrator.runAll('cron')
          break
      }
    }

    console.log(`[Cron] Completed: ${result.totalActionsQueued} queued, ${result.totalActionsExecuted} executed`)

    return NextResponse.json({
      success: true,
      schedule,
      result: {
        runId: result.runId,
        duration: result.durationMs,
        agents: result.agents.map(a => ({
          id: a.agentId,
          role: a.agentRole,
          status: a.status,
          actionsQueued: a.actionsQueued,
          actionsExecuted: a.actionsExecuted,
          errors: a.errors,
        })),
        totalActionsQueued: result.totalActionsQueued,
        totalActionsExecuted: result.totalActionsExecuted,
        hasErrors: result.hasErrors,
      },
    })

  } catch (error: any) {
    console.error('[Cron] Error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        schedule,
      },
      { status: 500 }
    )
  }
}

// Also support POST for webhook triggers
export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { agentId, triggerData } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }

    console.log(`[Webhook] Triggering agent: ${agentId}`)

    const result = await orchestrator.runAgent(agentId, 'webhook', triggerData)
    
    if (!result) {
      return NextResponse.json(
        { error: `Agent not found: ${agentId}` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      result: {
        agentId: result.agentId,
        status: result.status,
        actionsQueued: result.actionsQueued,
        actionsExecuted: result.actionsExecuted,
        errors: result.errors,
        duration: result.durationMs,
      },
    })

  } catch (error: any) {
    console.error('[Webhook] Error:', error)
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

