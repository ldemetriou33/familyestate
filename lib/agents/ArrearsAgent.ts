/**
 * ABBEY OS - Multi-Agent Architecture
 * ArrearsAgent
 * 
 * Role: Monitors rent roll, identifies overdue payments, and initiates chase process
 * 
 * Trigger: Daily Cron Job at 9 AM
 * Tools: checkRentRoll(), sendEmail(), queueActionItem()
 * Actions:
 *   - > 3 days late: Draft mild chase email, queue for approval
 *   - > 7 days late: Draft firm chase email, queue for approval
 *   - > 14 days late: Draft final notice, queue for urgent approval
 */

import { BaseAgent } from './BaseAgent'
import { AgentRunContext } from './types'
import { checkRentRoll, sendEmail, queueActionItem } from './tools'
import { chase_mild, chase_firm, chase_final, ArrearsTenantData } from './templates'

export class ArrearsAgent extends BaseAgent {
  constructor() {
    super(
      'arrears-agent-001',
      'ArrearsCollector',
      'Monitors rent roll for overdue payments and initiates appropriate chase actions',
      { approvalThreshold: 0.9 }  // Higher threshold - always require approval for tenant comms
    )

    // Register tools this agent can use
    this.registerTool(checkRentRoll)
    this.registerTool(sendEmail)
    this.registerTool(queueActionItem)
  }

  // ============================================
  // OBSERVE - Check rent roll for arrears
  // ============================================

  protected async observe(context: AgentRunContext): Promise<Record<string, unknown>> {
    const checkRentRollTool = this.getTool('checkRentRoll')
    if (!checkRentRollTool) {
      return { tenants: [], error: 'checkRentRoll tool not found' }
    }

    // Get all tenants with at least 3 days overdue
    const result = await checkRentRollTool.execute({ daysOverdue: 3 })
    
    if (!result.success) {
      return { tenants: [], error: result.error }
    }

    const data = result.data as { 
      tenants: Array<{
        tenantName: string
        unitNumber: string
        arrearsDays: number
        arrearsAmount: number
        email: string
      }>
      count: number
      totalArrears: number
    }

    // Categorize by severity
    const mildArrears = data.tenants.filter(t => t.arrearsDays >= 3 && t.arrearsDays < 7)
    const firmArrears = data.tenants.filter(t => t.arrearsDays >= 7 && t.arrearsDays < 14)
    const finalArrears = data.tenants.filter(t => t.arrearsDays >= 14)

    return {
      allTenants: data.tenants,
      mildArrears,
      firmArrears,
      finalArrears,
      totalCount: data.count,
      totalArrearsAmount: data.totalArrears,
      runDate: context.runAt.toISOString(),
    }
  }

  // ============================================
  // SYSTEM PROMPT - Define agent's reasoning
  // ============================================

  protected getSystemPrompt(): string {
    return `You are the Arrears Collection Agent for Abbey OS, a property estate management system.

Your responsibilities:
1. Review tenants in arrears
2. Draft appropriate chase communications based on how long they've been overdue
3. Queue all communications for human approval (NEVER send without approval)

ARREARS POLICY:
- 3-6 days overdue: Send MILD chase (friendly reminder)
- 7-13 days overdue: Send FIRM chase (formal notice)
- 14+ days overdue: Send FINAL notice (warning of legal action)

CRITICAL RULES:
1. ALL tenant communications MUST be queued for approval - never auto-send
2. Be professional and compassionate - tenants may be experiencing hardship
3. Reference specific amounts and dates in communications
4. Log all actions taken for audit purposes

For each tenant in arrears, use queueActionItem to create an action with:
- The appropriate email template filled in
- Priority based on days overdue (higher = more urgent)
- Clear description of what needs to be sent

Process tenants one at a time, starting with the most severe cases.`
  }

  // ============================================
  // USER PROMPT - Present observations
  // ============================================

  protected buildUserPrompt(observations: Record<string, unknown>): string {
    const mildArrears = observations.mildArrears as Array<Record<string, unknown>> || []
    const firmArrears = observations.firmArrears as Array<Record<string, unknown>> || []
    const finalArrears = observations.finalArrears as Array<Record<string, unknown>> || []
    const totalAmount = observations.totalArrearsAmount as number || 0

    const totalTenants = mildArrears.length + firmArrears.length + finalArrears.length

    if (totalTenants === 0) {
      return `No tenants are currently in arrears (over 3 days overdue).

No action required at this time.`
    }

    let prompt = `ARREARS REPORT - ${observations.runDate}
Total Outstanding: £${totalAmount.toLocaleString()}
Total Tenants in Arrears: ${totalTenants}

`

    if (finalArrears.length > 0) {
      prompt += `🔴 FINAL NOTICE REQUIRED (14+ days overdue): ${finalArrears.length} tenants
${finalArrears.map((t: any) => `  - ${t.tenantName} (${t.unitNumber}): £${t.arrearsAmount} - ${t.arrearsDays} days`).join('\n')}

`
    }

    if (firmArrears.length > 0) {
      prompt += `🟠 FIRM CHASE REQUIRED (7-13 days overdue): ${firmArrears.length} tenants
${firmArrears.map((t: any) => `  - ${t.tenantName} (${t.unitNumber}): £${t.arrearsAmount} - ${t.arrearsDays} days`).join('\n')}

`
    }

    if (mildArrears.length > 0) {
      prompt += `🟡 MILD REMINDER REQUIRED (3-6 days overdue): ${mildArrears.length} tenants
${mildArrears.map((t: any) => `  - ${t.tenantName} (${t.unitNumber}): £${t.arrearsAmount} - ${t.arrearsDays} days`).join('\n')}

`
    }

    prompt += `
Process the most urgent case first (final notices, then firm, then mild).
Use queueActionItem to create an approval request for sending the appropriate chase email.

What action should we take for the most urgent case?`

    return prompt
  }
}

// Export singleton instance
export const arrearsAgent = new ArrearsAgent()

