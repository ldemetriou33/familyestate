'use client'

import { useState, useEffect } from 'react'
import { 
  Bot, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Wrench,
  Wallet,
  TrendingUp,
  ChevronRight,
  Zap
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  getRegisteredAgents, 
  getOrchestratorStatus, 
  getQueuedActions,
  getRunHistory,
  runAgent,
  runAllAgents,
  approveAction,
  rejectAction 
} from '@/actions/agents'
import { QueuedAction } from '@/lib/agents/types'

const agentIcons: Record<string, React.ElementType> = {
  MaintenanceManager: Wrench,
  ArrearsCollector: Wallet,
  RevenueManager: TrendingUp,
  EnergyManager: Zap,
}

const agentColors: Record<string, string> = {
  MaintenanceManager: 'text-blue-500',
  ArrearsCollector: 'text-amber-500',
  RevenueManager: 'text-emerald-500',
  EnergyManager: 'text-cyan-500',
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<Array<{ id: string; role: string; description: string }>>([])
  const [status, setStatus] = useState<{
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
  } | null>(null)
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([])
  const [runHistory, setRunHistory] = useState<Array<Record<string, unknown>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [runningAgent, setRunningAgent] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      const [agentsData, statusData, actionsData, historyData] = await Promise.all([
        getRegisteredAgents(),
        getOrchestratorStatus(),
        getQueuedActions(),
        getRunHistory(5),
      ])
      
      setAgents(agentsData)
      setStatus(statusData)
      setQueuedActions(actionsData)
      setRunHistory(historyData)
    } catch (error) {
      console.error('Failed to load agent data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRunAgent(agentId: string) {
    setRunningAgent(agentId)
    try {
      const result = await runAgent(agentId)
      if (result.success) {
        await loadData()  // Refresh data
      } else {
        alert(`Agent failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to run agent:', error)
    } finally {
      setRunningAgent(null)
    }
  }

  async function handleRunAll() {
    setRunningAgent('all')
    try {
      const result = await runAllAgents()
      if (result.success) {
        await loadData()
      } else {
        alert(`Run failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to run all agents:', error)
    } finally {
      setRunningAgent(null)
    }
  }

  async function handleApprove(actionId: string) {
    await approveAction(actionId)
    await loadData()
  }

  async function handleReject(actionId: string) {
    const reason = prompt('Reason for rejection:')
    if (reason) {
      await rejectAction(actionId, reason)
      await loadData()
    }
  }

  if (isLoading) {
    return (
      <Card className="border-[var(--border-primary)]">
        <CardContent className="py-12 text-center">
          <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading agents...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card className="border-[var(--border-primary)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="w-5 h-5 text-[var(--accent)]" />
              Multi-Agent System
              <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                BETA
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
              <button
                onClick={handleRunAll}
                disabled={runningAgent !== null}
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent)]/90 disabled:opacity-50"
              >
                {runningAgent === 'all' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Run All
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {status?.registeredAgents || 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Active Agents</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {status?.recentRuns || 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Recent Runs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">
                {queuedActions.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Pending Approval</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {status?.lastRun?.totalActionsExecuted || 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Actions Executed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent List */}
        <Card className="border-[var(--border-primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Registered Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map(agent => {
              const Icon = agentIcons[agent.role] || Bot
              const color = agentColors[agent.role] || 'text-[var(--accent)]'
              const isRunning = runningAgent === agent.id
              
              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-[var(--bg-tertiary)] rounded-lg`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">
                        {agent.role}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunAgent(agent.id)}
                    disabled={runningAgent !== null}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--bg-tertiary)] hover:bg-[var(--accent)]/20 text-[var(--text-muted)] hover:text-[var(--accent)] rounded transition-colors disabled:opacity-50"
                  >
                    {isRunning ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Run
                  </button>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="border-[var(--border-primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Pending Approvals
              {queuedActions.filter(a => a.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-amber-500/10 text-amber-500 rounded">
                  {queuedActions.filter(a => a.status === 'pending').length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queuedActions.filter(a => a.status === 'pending').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-green-500/30 mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queuedActions
                  .filter(a => a.status === 'pending')
                  .slice(0, 5)
                  .map(action => (
                    <div
                      key={action.id}
                      className="p-3 bg-[var(--bg-secondary)] rounded-lg border-l-4 border-amber-500"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                            {action.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                            {action.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-[var(--text-muted)]">
                              Confidence: {Math.round(action.confidence * 100)}%
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              action.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                              action.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {action.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprove(action.id)}
                            className="p-1.5 hover:bg-green-500/20 rounded text-green-500"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(action.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded text-red-500"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Run History */}
      <Card className="border-[var(--border-primary)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Agent Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {runHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-[var(--text-muted)]/30 mx-auto mb-2" />
              <p className="text-sm text-[var(--text-muted)]">No runs yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {runHistory.map((run: any, i) => (
                <div
                  key={run.runId || i}
                  className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {run.hasErrors ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">
                        {run.triggeredBy.toUpperCase()} Run
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(run.startedAt).toLocaleString()} • {run.durationMs}ms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[var(--text-muted)]">
                      {run.agents?.length || 0} agents
                    </span>
                    <span className="text-green-500">
                      {run.totalActionsExecuted} executed
                    </span>
                    <span className="text-amber-500">
                      {run.totalActionsQueued} queued
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

