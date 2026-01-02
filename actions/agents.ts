'use server'

/**
 * ABBEY OS - Agent Server Actions
 * 
 * Server actions for interacting with the Multi-Agent System
 */

import { orchestrator } from '@/lib/agents'
import { QueuedAction, AgentRunResult } from '@/lib/agents/types'
import { OrchestratorRunResult } from '@/lib/agents/Orchestrator'

// ============================================
// RUN AGENTS
// ============================================

/**
 * Run a specific agent manually
 */
export async function runAgent(agentId: string): Promise<{
  success: boolean
  result?: AgentRunResult
  error?: string
}> {
  try {
    const result = await orchestrator.runAgent(agentId, 'manual')
    
    if (!result) {
      return { success: false, error: `Agent not found: ${agentId}` }
    }

    return { success: true, result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Run all agents
 */
export async function runAllAgents(): Promise<{
  success: boolean
  result?: OrchestratorRunResult
  error?: string
}> {
  try {
    const result = await orchestrator.runAll('manual')
    return { success: true, result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// QUERY AGENTS
// ============================================

/**
 * Get list of registered agents
 */
export async function getRegisteredAgents(): Promise<Array<{
  id: string
  role: string
  description: string
}>> {
  return orchestrator.listAgents()
}

/**
 * Get orchestrator status
 */
export async function getOrchestratorStatus(): Promise<{
  isRunning: boolean
  registeredAgents: number
  recentRuns: number
  lastRun?: {
    runId: string
    triggeredBy: string
    durationMs: number
    hasErrors: boolean
    totalActionsQueued: number
    totalActionsExecuted: number
  }
}> {
  const status = orchestrator.getStatus()
  
  return {
    isRunning: status.isRunning,
    registeredAgents: status.registeredAgents,
    recentRuns: status.recentRuns,
    lastRun: status.lastRun ? {
      runId: status.lastRun.runId,
      triggeredBy: status.lastRun.triggeredBy,
      durationMs: status.lastRun.durationMs,
      hasErrors: status.lastRun.hasErrors,
      totalActionsQueued: status.lastRun.totalActionsQueued,
      totalActionsExecuted: status.lastRun.totalActionsExecuted,
    } : undefined,
  }
}

/**
 * Get all queued actions from all agents
 */
export async function getQueuedActions(): Promise<QueuedAction[]> {
  return orchestrator.getAllQueuedActions()
}

/**
 * Get recent run history
 */
export async function getRunHistory(limit: number = 10): Promise<Array<{
  runId: string
  triggeredBy: string
  startedAt: string
  completedAt: string
  durationMs: number
  agents: Array<{
    agentId: string
    agentRole: string
    status: string
    actionsQueued: number
    actionsExecuted: number
    errorsCount: number
  }>
  totalActionsQueued: number
  totalActionsExecuted: number
  hasErrors: boolean
}>> {
  const history = orchestrator.getRunHistory(limit)
  
  return history.map(run => ({
    runId: run.runId,
    triggeredBy: run.triggeredBy,
    startedAt: run.startedAt.toISOString(),
    completedAt: run.completedAt.toISOString(),
    durationMs: run.durationMs,
    agents: run.agents.map(a => ({
      agentId: a.agentId,
      agentRole: a.agentRole,
      status: a.status,
      actionsQueued: a.actionsQueued,
      actionsExecuted: a.actionsExecuted,
      errorsCount: a.errors.length,
    })),
    totalActionsQueued: run.totalActionsQueued,
    totalActionsExecuted: run.totalActionsExecuted,
    hasErrors: run.hasErrors,
  }))
}

// ============================================
// ACTION APPROVAL
// ============================================

/**
 * Approve a queued action
 */
export async function approveAction(actionId: string): Promise<{
  success: boolean
  error?: string
}> {
  // TODO: Implement approval logic
  // This would update the action status and execute it
  console.log(`Approving action: ${actionId}`)
  
  return { success: true }
}

/**
 * Reject a queued action
 */
export async function rejectAction(actionId: string, reason: string): Promise<{
  success: boolean
  error?: string
}> {
  // TODO: Implement rejection logic
  console.log(`Rejecting action: ${actionId}, reason: ${reason}`)
  
  return { success: true }
}

