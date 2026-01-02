/**
 * ABBEY OS - Multi-Agent Architecture
 * MaintenanceAgent
 * 
 * Role: Monitors maintenance tickets, classifies severity, and dispatches contractors
 * 
 * Trigger: New row in MaintenanceTicket (database trigger) or hourly cron
 * Tools: classifySeverity(), sendSMS(), queueActionItem()
 * Actions:
 *   - HIGH severity: SMS contractor immediately
 *   - LOW severity: Add to weekly digest
 */

import { BaseAgent } from './BaseAgent'
import { AgentRunContext } from './types'
import { 
  getMaintenanceTickets, 
  classifySeverity, 
  sendSMS, 
  queueActionItem 
} from './tools'
import { contractor_urgent_sms } from './templates'

export class MaintenanceAgent extends BaseAgent {
  constructor() {
    super(
      'maintenance-agent-001',
      'MaintenanceManager',
      'Monitors maintenance tickets, classifies severity, and dispatches contractors for urgent issues',
      { approvalThreshold: 0.7 }  // Lower threshold - we trust this agent more
    )

    // Register tools this agent can use
    this.registerTool(getMaintenanceTickets)
    this.registerTool(classifySeverity)
    this.registerTool(sendSMS)
    this.registerTool(queueActionItem)
  }

  // ============================================
  // OBSERVE - Gather maintenance ticket data
  // ============================================

  protected async observe(context: AgentRunContext): Promise<Record<string, unknown>> {
    // If triggered by a specific ticket, use that
    if (context.triggerData && typeof context.triggerData === 'object') {
      const ticket = context.triggerData as Record<string, unknown>
      return {
        newTickets: [ticket],
        ticketCount: 1,
        triggerType: 'specific_ticket',
      }
    }

    // Otherwise, fetch all new tickets
    const getTicketsTool = this.getTool('getMaintenanceTickets')
    if (!getTicketsTool) {
      return { newTickets: [], ticketCount: 0, error: 'getMaintenanceTickets tool not found' }
    }

    const result = await getTicketsTool.execute({ status: 'new', limit: 20 })
    
    if (!result.success) {
      return { newTickets: [], ticketCount: 0, error: result.error }
    }

    const data = result.data as { tickets: Array<Record<string, unknown>>; count: number }
    
    return {
      newTickets: data.tickets,
      ticketCount: data.count,
      triggerType: 'scheduled_scan',
    }
  }

  // ============================================
  // SYSTEM PROMPT - Define agent's reasoning
  // ============================================

  protected getSystemPrompt(): string {
    return `You are the Maintenance Manager Agent for Abbey OS, a property estate management system.

Your responsibilities:
1. Review new maintenance tickets
2. Classify their severity (high or low)
3. For HIGH severity issues, dispatch an SMS to the contractor immediately
4. For LOW severity issues, queue them for the weekly digest

SEVERITY CLASSIFICATION RULES:
- HIGH: Safety hazards, loss of essential services (heating, hot water, electricity), security issues, flooding, gas leaks
- LOW: Cosmetic issues, non-urgent repairs, minor inconveniences

CONTRACTOR INFORMATION:
- Primary contractor phone: +447700000001
- Emergency contractor phone: +447700000002

When you identify a HIGH severity issue:
1. Use classifySeverity to confirm
2. Use sendSMS to alert the contractor
3. Use queueActionItem to log the action taken

When you identify a LOW severity issue:
1. Use queueActionItem to add to weekly digest

Always explain your reasoning clearly. If you're unsure about severity, err on the side of caution and classify as HIGH.`
  }

  // ============================================
  // USER PROMPT - Present observations
  // ============================================

  protected buildUserPrompt(observations: Record<string, unknown>): string {
    const tickets = observations.newTickets as Array<Record<string, unknown>> || []
    const ticketCount = observations.ticketCount as number || 0

    if (ticketCount === 0) {
      return `No new maintenance tickets found during this scan.

Decide if any action is needed (suggestedAction: null if nothing to do).`
    }

    const ticketDetails = tickets.map((t, i) => `
TICKET ${i + 1}:
- ID: ${t.id}
- Title: ${t.title}
- Description: ${t.description}
- Location: ${t.location}
- Reported by: ${t.reportedBy}
- Reported at: ${t.reportedAt}
- Current severity: ${t.severity || 'NOT CLASSIFIED'}
`).join('\n')

    return `NEW MAINTENANCE TICKETS (${ticketCount} total):
${ticketDetails}

For EACH unclassified ticket:
1. Classify its severity
2. Take appropriate action (SMS for high, queue for low)

Start with the first unclassified ticket. What action should we take?`
  }
}

// Export singleton instance
export const maintenanceAgent = new MaintenanceAgent()

