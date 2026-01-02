/**
 * ABBEY OS - Multi-Agent Architecture
 * BaseAgent Class - The Foundation for All Specialized Agents
 * 
 * Implements the ReAct (Reasoning + Acting) pattern:
 * 1. OBSERVE: Gather context from triggers and database
 * 2. THINK: Use GPT-4 to reason about what to do
 * 3. ACT: Execute tools or queue actions for approval
 * 4. REFLECT: Log results and update state
 */

import OpenAI from 'openai'
import { 
  AgentRole, 
  AgentTool, 
  AgentRunContext, 
  AgentRunResult,
  AgentDecision,
  AgentThought,
  AgentAction,
  QueuedAction,
  ToolResult,
} from './types'

// Lazy initialization to prevent build-time errors
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _openai
}

// ============================================
// BASE AGENT CLASS
// ============================================

export abstract class BaseAgent {
  // Identity
  readonly id: string
  readonly role: AgentRole
  readonly description: string
  
  // Capabilities
  protected tools: Map<string, AgentTool> = new Map()
  
  // Configuration
  protected approvalThreshold: number = 0.8  // Below this confidence, require approval
  protected maxIterations: number = 5        // Prevent infinite loops
  
  // State
  protected isRunning: boolean = false
  protected currentContext: AgentRunContext | null = null
  protected decisions: AgentDecision[] = []
  protected actionQueue: QueuedAction[] = []

  constructor(
    id: string,
    role: AgentRole,
    description: string,
    config?: { approvalThreshold?: number; maxIterations?: number }
  ) {
    this.id = id
    this.role = role
    this.description = description
    
    if (config?.approvalThreshold !== undefined) {
      this.approvalThreshold = config.approvalThreshold
    }
    if (config?.maxIterations !== undefined) {
      this.maxIterations = config.maxIterations
    }
  }

  // ============================================
  // TOOL MANAGEMENT
  // ============================================

  protected registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool)
  }

  protected getTool(name: string): AgentTool | undefined {
    return this.tools.get(name)
  }

  protected getToolDescriptions(): string {
    return Array.from(this.tools.values())
      .map(tool => {
        const params = Object.entries(tool.parameters)
          .map(([key, val]) => `  - ${key} (${val.type}${val.required ? ', required' : ''}): ${val.description}`)
          .join('\n')
        return `${tool.name}: ${tool.description}\nParameters:\n${params}`
      })
      .join('\n\n')
  }

  // ============================================
  // ABSTRACT METHODS (Implemented by each agent)
  // ============================================

  /**
   * Gather relevant data based on the trigger context
   */
  protected abstract observe(context: AgentRunContext): Promise<Record<string, unknown>>

  /**
   * Define the system prompt for this agent's reasoning
   */
  protected abstract getSystemPrompt(): string

  /**
   * Build the user prompt with observed data
   */
  protected abstract buildUserPrompt(observations: Record<string, unknown>): string

  // ============================================
  // CORE RUN LOOP (ReAct Pattern)
  // ============================================

  /**
   * Main execution loop - called by the Orchestrator
   */
  async run(context: AgentRunContext): Promise<AgentRunResult> {
    const startedAt = new Date()
    this.isRunning = true
    this.currentContext = context
    this.decisions = []
    this.actionQueue = []
    const errors: string[] = []

    console.log(`[${this.role}] Starting run with trigger: ${context.triggerType}`)

    try {
      // STEP 1: OBSERVE
      console.log(`[${this.role}] Observing...`)
      const observations = await this.observe(context)

      // STEP 2: THINK (with iteration limit)
      let iteration = 0
      let shouldContinue = true

      while (shouldContinue && iteration < this.maxIterations) {
        iteration++
        console.log(`[${this.role}] Thinking (iteration ${iteration})...`)

        const thought = await this.think(observations)
        
        // If no action suggested, we're done
        if (!thought.suggestedAction) {
          console.log(`[${this.role}] No further action needed`)
          this.decisions.push({
            thought,
            action: null,
            requiresApproval: false,
          })
          shouldContinue = false
          continue
        }

        // STEP 3: ACT (or queue for approval)
        const decision = await this.act(thought)
        this.decisions.push(decision)

        // If action requires approval, stop and queue it
        if (decision.requiresApproval) {
          console.log(`[${this.role}] Action queued for approval: ${thought.suggestedAction}`)
          shouldContinue = false
        }

        // If action failed, stop
        if (decision.action?.result && !decision.action.result.success) {
          errors.push(decision.action.result.error || 'Unknown error')
          shouldContinue = false
        }
      }

      // STEP 4: REFLECT - save queued actions
      await this.persistQueuedActions()

    } catch (error: any) {
      console.error(`[${this.role}] Error:`, error)
      errors.push(error.message || 'Unknown error')
    } finally {
      this.isRunning = false
      this.currentContext = null
    }

    const completedAt = new Date()
    const actionsExecuted = this.decisions.filter(d => 
      d.action?.result?.success && !d.requiresApproval
    ).length
    const actionsQueued = this.actionQueue.length

    const result: AgentRunResult = {
      agentId: this.id,
      agentRole: this.role,
      status: errors.length > 0 ? 'error' : 
              actionsQueued > 0 ? 'pending_approval' : 
              'success',
      decisions: this.decisions,
      actionsQueued,
      actionsExecuted,
      errors,
      startedAt,
      completedAt,
      durationMs: completedAt.getTime() - startedAt.getTime(),
    }

    console.log(`[${this.role}] Run complete: ${result.status} (${result.durationMs}ms)`)
    return result
  }

  // ============================================
  // THINKING (GPT-4 Reasoning)
  // ============================================

  protected async think(observations: Record<string, unknown>): Promise<AgentThought> {
    const systemPrompt = this.getSystemPrompt()
    const userPrompt = this.buildUserPrompt(observations)
    const toolDescriptions = this.getToolDescriptions()

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `${userPrompt}

AVAILABLE TOOLS:
${toolDescriptions}

Based on the above context, decide what action to take (if any).
Respond in JSON format:
{
  "reasoning": "Your step-by-step reasoning about what to do",
  "confidence": 0.0-1.0,
  "suggestedAction": "tool_name or null if no action needed",
  "suggestedParams": { "param1": "value1" } or null
}`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0].message.content || '{}'
    const parsed = JSON.parse(content)

    return {
      reasoning: parsed.reasoning || 'No reasoning provided',
      confidence: parsed.confidence || 0.5,
      suggestedAction: parsed.suggestedAction || undefined,
      suggestedParams: parsed.suggestedParams || undefined,
    }
  }

  // ============================================
  // ACTING (Execute or Queue)
  // ============================================

  protected async act(thought: AgentThought): Promise<AgentDecision> {
    if (!thought.suggestedAction) {
      return {
        thought,
        action: null,
        requiresApproval: false,
      }
    }

    const tool = this.getTool(thought.suggestedAction)
    if (!tool) {
      return {
        thought,
        action: {
          id: crypto.randomUUID(),
          tool: thought.suggestedAction,
          params: thought.suggestedParams || {},
          result: { success: false, error: `Tool not found: ${thought.suggestedAction}` },
          timestamp: new Date(),
        },
        requiresApproval: false,
      }
    }

    // Check if approval is needed
    const requiresApproval = thought.confidence < this.approvalThreshold

    if (requiresApproval) {
      // Queue for approval instead of executing
      const queuedAction: QueuedAction = {
        id: crypto.randomUUID(),
        agentId: this.id,
        agentRole: this.role,
        title: `${this.role}: ${thought.suggestedAction}`,
        description: thought.reasoning,
        tool: thought.suggestedAction,
        params: thought.suggestedParams || {},
        priority: thought.confidence > 0.6 ? 'medium' : 'high',
        requiresApproval: true,
        approvalReason: `Confidence ${Math.round(thought.confidence * 100)}% is below threshold ${Math.round(this.approvalThreshold * 100)}%`,
        status: 'pending',
        createdAt: new Date(),
        reasoning: thought.reasoning,
        confidence: thought.confidence,
        sourceRecordIds: [],
      }
      this.actionQueue.push(queuedAction)

      return {
        thought,
        action: {
          id: queuedAction.id,
          tool: thought.suggestedAction,
          params: thought.suggestedParams || {},
          timestamp: new Date(),
        },
        requiresApproval: true,
        approvalReason: queuedAction.approvalReason,
      }
    }

    // Execute immediately
    console.log(`[${this.role}] Executing: ${thought.suggestedAction}`)
    const result = await tool.execute(thought.suggestedParams || {})

    return {
      thought,
      action: {
        id: crypto.randomUUID(),
        tool: thought.suggestedAction,
        params: thought.suggestedParams || {},
        result,
        timestamp: new Date(),
      },
      requiresApproval: false,
    }
  }

  // ============================================
  // PERSISTENCE
  // ============================================

  protected async persistQueuedActions(): Promise<void> {
    // In production, this would save to the database
    // For now, we'll emit events that the Command Center can subscribe to
    for (const action of this.actionQueue) {
      console.log(`[${this.role}] Queued action: ${action.title}`)
      // TODO: Save to ActionItem table in database
      // await prisma.actionItem.create({ ... })
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  getStatus(): { isRunning: boolean; lastDecisions: AgentDecision[] } {
    return {
      isRunning: this.isRunning,
      lastDecisions: this.decisions,
    }
  }

  getQueuedActions(): QueuedAction[] {
    return [...this.actionQueue]
  }
}

