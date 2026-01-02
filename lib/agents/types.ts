/**
 * ABBEY OS - Multi-Agent Architecture
 * Type Definitions for the Agent Protocol
 */

// ============================================
// AGENT TYPES
// ============================================

export type AgentRole = 
  | 'MaintenanceManager'
  | 'ArrearsCollector'
  | 'RevenueManager'
  | 'ComplianceOfficer'
  | 'GuestExperience'
  | 'CashflowGuardian'
  | 'LegalAdvisor'

export type AgentTriggerType = 
  | 'cron'           // Scheduled execution
  | 'database'       // Database row change
  | 'webhook'        // External webhook
  | 'manual'         // Manual invocation
  | 'event'          // Internal event bus

export type AgentStatus = 
  | 'idle'
  | 'thinking'
  | 'acting'
  | 'waiting_approval'
  | 'completed'
  | 'error'

// ============================================
// TOOL TYPES
// ============================================

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    description: string
    required?: boolean
  }>
  execute: (params: Record<string, unknown>) => Promise<ToolResult>
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
  metadata?: Record<string, unknown>
}

// ============================================
// THOUGHT & ACTION TYPES (ReAct Pattern)
// ============================================

export interface AgentThought {
  reasoning: string
  confidence: number
  suggestedAction?: string
  suggestedParams?: Record<string, unknown>
}

export interface AgentAction {
  id: string
  tool: string
  params: Record<string, unknown>
  result?: ToolResult
  timestamp: Date
}

export interface AgentDecision {
  thought: AgentThought
  action: AgentAction | null
  requiresApproval: boolean
  approvalReason?: string
}

// ============================================
// RUN CONTEXT & RESULT
// ============================================

export interface AgentRunContext {
  triggerId: string
  triggerType: AgentTriggerType
  triggerData?: unknown
  runAt: Date
}

export interface AgentRunResult {
  agentId: string
  agentRole: AgentRole
  status: 'success' | 'partial' | 'error' | 'pending_approval'
  decisions: AgentDecision[]
  actionsQueued: number
  actionsExecuted: number
  errors: string[]
  startedAt: Date
  completedAt: Date
  durationMs: number
}

// ============================================
// ACTION QUEUE TYPES
// ============================================

export interface QueuedAction {
  id: string
  agentId: string
  agentRole: AgentRole
  title: string
  description: string
  tool: string
  params: Record<string, unknown>
  priority: 'critical' | 'high' | 'medium' | 'low'
  requiresApproval: boolean
  approvalReason?: string
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed'
  createdAt: Date
  executedAt?: Date
  result?: ToolResult
  // For audit trail
  reasoning: string
  confidence: number
  sourceRecordIds: string[]
}

// ============================================
// ORCHESTRATOR TYPES
// ============================================

export interface OrchestratorConfig {
  agents: AgentConfig[]
  defaultApprovalThreshold: number  // Confidence below this requires approval
  maxConcurrentAgents: number
  enableLogging: boolean
}

export interface AgentConfig {
  id: string
  role: AgentRole
  enabled: boolean
  triggers: AgentTrigger[]
  approvalThreshold?: number
}

export interface AgentTrigger {
  type: AgentTriggerType
  config: CronTriggerConfig | DatabaseTriggerConfig | WebhookTriggerConfig
}

export interface CronTriggerConfig {
  schedule: string  // Cron expression
  timezone?: string
}

export interface DatabaseTriggerConfig {
  table: string
  event: 'insert' | 'update' | 'delete'
  filter?: Record<string, unknown>
}

export interface WebhookTriggerConfig {
  endpoint: string
  secret?: string
}

