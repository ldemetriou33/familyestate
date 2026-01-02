/**
 * ABBEY OS - Multi-Agent Architecture
 * Orchestrator
 * 
 * The Orchestrator manages agent lifecycle:
 * 1. Schedules agent runs based on triggers
 * 2. Aggregates results from multiple agents
 * 3. Feeds outputs to the Command Center
 * 4. Handles errors and retries
 */

import { BaseAgent } from './BaseAgent'
import { maintenanceAgent } from './MaintenanceAgent'
import { arrearsAgent } from './ArrearsAgent'
import { pricingAgent } from './PricingAgent'
import { 
  AgentRunContext, 
  AgentRunResult, 
  AgentTriggerType,
  OrchestratorConfig,
  QueuedAction,
} from './types'

// ============================================
// ORCHESTRATOR RESULT TYPES
// ============================================

export interface OrchestratorRunResult {
  runId: string
  triggeredBy: string
  startedAt: Date
  completedAt: Date
  durationMs: number
  agents: AgentRunResult[]
  totalActionsQueued: number
  totalActionsExecuted: number
  hasErrors: boolean
  errors: string[]
}

export interface AgentRegistry {
  [key: string]: BaseAgent
}

// ============================================
// ORCHESTRATOR CLASS
// ============================================

export class Orchestrator {
  private agents: AgentRegistry = {}
  private config: OrchestratorConfig
  private isRunning: boolean = false
  private runHistory: OrchestratorRunResult[] = []
  private maxHistorySize: number = 100

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      agents: [],
      defaultApprovalThreshold: 0.8,
      maxConcurrentAgents: 3,
      enableLogging: true,
      ...config,
    }

    // Register default agents
    this.registerAgent('maintenance', maintenanceAgent)
    this.registerAgent('arrears', arrearsAgent)
    this.registerAgent('pricing', pricingAgent)
  }

  // ============================================
  // AGENT MANAGEMENT
  // ============================================

  registerAgent(id: string, agent: BaseAgent): void {
    this.agents[id] = agent
    this.log(`Registered agent: ${id} (${agent.role})`)
  }

  getAgent(id: string): BaseAgent | undefined {
    return this.agents[id]
  }

  listAgents(): Array<{ id: string; role: string; description: string }> {
    return Object.entries(this.agents).map(([id, agent]) => ({
      id,
      role: agent.role,
      description: agent.description,
    }))
  }

  // ============================================
  // RUN ORCHESTRATION
  // ============================================

  /**
   * Run a specific agent by ID
   */
  async runAgent(
    agentId: string,
    triggerType: AgentTriggerType = 'manual',
    triggerData?: unknown
  ): Promise<AgentRunResult | null> {
    const agent = this.agents[agentId]
    if (!agent) {
      this.log(`Agent not found: ${agentId}`, 'error')
      return null
    }

    const context: AgentRunContext = {
      triggerId: crypto.randomUUID(),
      triggerType,
      triggerData,
      runAt: new Date(),
    }

    this.log(`Starting agent: ${agentId}`)
    const result = await agent.run(context)
    this.log(`Agent completed: ${agentId} - ${result.status}`)

    return result
  }

  /**
   * Run multiple agents (e.g., for a scheduled batch)
   */
  async runAgents(
    agentIds: string[],
    triggerType: AgentTriggerType = 'cron'
  ): Promise<OrchestratorRunResult> {
    const runId = crypto.randomUUID()
    const startedAt = new Date()
    const results: AgentRunResult[] = []
    const errors: string[] = []

    this.isRunning = true
    this.log(`Starting orchestrator run: ${runId}`)
    this.log(`Agents to run: ${agentIds.join(', ')}`)

    // Run agents (could be parallel with concurrency limit)
    for (const agentId of agentIds) {
      try {
        const result = await this.runAgent(agentId, triggerType)
        if (result) {
          results.push(result)
          if (result.errors.length > 0) {
            errors.push(...result.errors.map(e => `[${agentId}] ${e}`))
          }
        }
      } catch (error: any) {
        const errorMsg = `[${agentId}] Fatal error: ${error.message}`
        errors.push(errorMsg)
        this.log(errorMsg, 'error')
      }
    }

    const completedAt = new Date()
    const orchestratorResult: OrchestratorRunResult = {
      runId,
      triggeredBy: triggerType,
      startedAt,
      completedAt,
      durationMs: completedAt.getTime() - startedAt.getTime(),
      agents: results,
      totalActionsQueued: results.reduce((sum, r) => sum + r.actionsQueued, 0),
      totalActionsExecuted: results.reduce((sum, r) => sum + r.actionsExecuted, 0),
      hasErrors: errors.length > 0,
      errors,
    }

    // Store in history
    this.runHistory.unshift(orchestratorResult)
    if (this.runHistory.length > this.maxHistorySize) {
      this.runHistory = this.runHistory.slice(0, this.maxHistorySize)
    }

    this.isRunning = false
    this.log(`Orchestrator run complete: ${runId} (${orchestratorResult.durationMs}ms)`)

    return orchestratorResult
  }

  /**
   * Run all registered agents
   */
  async runAll(triggerType: AgentTriggerType = 'cron'): Promise<OrchestratorRunResult> {
    const agentIds = Object.keys(this.agents)
    return this.runAgents(agentIds, triggerType)
  }

  // ============================================
  // SCHEDULED RUNS (for Vercel Cron)
  // ============================================

  /**
   * Morning run - 9 AM daily
   * Runs: ArrearsAgent (check rent roll)
   */
  async morningRun(): Promise<OrchestratorRunResult> {
    this.log('Starting MORNING run')
    return this.runAgents(['arrears'], 'cron')
  }

  /**
   * Early morning run - 6 AM daily
   * Runs: PricingAgent (check occupancy)
   */
  async earlyMorningRun(): Promise<OrchestratorRunResult> {
    this.log('Starting EARLY MORNING run')
    return this.runAgents(['pricing'], 'cron')
  }

  /**
   * Hourly run
   * Runs: MaintenanceAgent (check new tickets)
   */
  async hourlyRun(): Promise<OrchestratorRunResult> {
    this.log('Starting HOURLY run')
    return this.runAgents(['maintenance'], 'cron')
  }

  /**
   * End of day run - 6 PM daily
   * Runs: All agents for daily summary
   */
  async endOfDayRun(): Promise<OrchestratorRunResult> {
    this.log('Starting END OF DAY run')
    return this.runAll('cron')
  }

  // ============================================
  // QUERY METHODS (for Command Center)
  // ============================================

  /**
   * Get all queued actions from all agents
   */
  getAllQueuedActions(): QueuedAction[] {
    const allActions: QueuedAction[] = []
    
    for (const agent of Object.values(this.agents)) {
      allActions.push(...agent.getQueuedActions())
    }

    // Sort by priority and creation time
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return allActions.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }

  /**
   * Get recent run history
   */
  getRunHistory(limit: number = 10): OrchestratorRunResult[] {
    return this.runHistory.slice(0, limit)
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    isRunning: boolean
    registeredAgents: number
    recentRuns: number
    lastRun?: OrchestratorRunResult
  } {
    return {
      isRunning: this.isRunning,
      registeredAgents: Object.keys(this.agents).length,
      recentRuns: this.runHistory.length,
      lastRun: this.runHistory[0],
    }
  }

  // ============================================
  // LOGGING
  // ============================================

  private log(message: string, level: 'info' | 'error' | 'warn' = 'info'): void {
    if (!this.config.enableLogging) return

    const timestamp = new Date().toISOString()
    const prefix = `[Orchestrator ${timestamp}]`

    switch (level) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`)
        break
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`)
        break
      default:
        console.log(`${prefix} ${message}`)
    }
  }
}

// Export singleton instance
export const orchestrator = new Orchestrator()

