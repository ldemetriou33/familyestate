/**
 * ABBEY OS - Multi-Agent Architecture
 * PricingAgent
 * 
 * Role: Monitors hotel occupancy and proposes dynamic pricing adjustments
 * 
 * Trigger: Daily at 6 AM, or when occupancy drops below threshold
 * Tools: checkOccupancy(), applyDiscount(), queueActionItem()
 * Actions:
 *   - Occupancy < 50% for next 7 days: Propose 10% discount
 *   - Occupancy < 30% for next 7 days: Propose 15% discount
 *   - Occupancy > 85%: Consider rate increase
 */

import { BaseAgent } from './BaseAgent'
import { AgentRunContext } from './types'
import { checkOccupancy, applyDiscount, queueActionItem } from './tools'
import { pricing_proposal_summary } from './templates'

export class PricingAgent extends BaseAgent {
  // Thresholds
  private readonly LOW_OCCUPANCY_THRESHOLD = 50
  private readonly CRITICAL_OCCUPANCY_THRESHOLD = 30
  private readonly HIGH_OCCUPANCY_THRESHOLD = 85
  private readonly LOOK_AHEAD_DAYS = 7

  constructor() {
    super(
      'pricing-agent-001',
      'RevenueManager',
      'Monitors occupancy patterns and proposes dynamic pricing to optimize revenue',
      { approvalThreshold: 0.85 }  // Require approval for pricing changes
    )

    // Register tools this agent can use
    this.registerTool(checkOccupancy)
    this.registerTool(applyDiscount)
    this.registerTool(queueActionItem)
  }

  // ============================================
  // OBSERVE - Check upcoming occupancy
  // ============================================

  protected async observe(context: AgentRunContext): Promise<Record<string, unknown>> {
    const checkOccupancyTool = this.getTool('checkOccupancy')
    if (!checkOccupancyTool) {
      return { error: 'checkOccupancy tool not found' }
    }

    // Calculate date range for next 7 days
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + this.LOOK_AHEAD_DAYS)

    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    const result = await checkOccupancyTool.execute({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    })

    if (!result.success) {
      return { error: result.error }
    }

    const data = result.data as {
      averageOccupancy: number
      dates: Array<{
        date: string
        occupancy: number
        roomsAvailable: number
        roomsBooked: number
      }>
      isLowOccupancy: boolean
    }

    // Analyze occupancy patterns
    const lowDays = data.dates.filter(d => d.occupancy < this.LOW_OCCUPANCY_THRESHOLD)
    const criticalDays = data.dates.filter(d => d.occupancy < this.CRITICAL_OCCUPANCY_THRESHOLD)
    const highDays = data.dates.filter(d => d.occupancy > this.HIGH_OCCUPANCY_THRESHOLD)

    // Calculate potential revenue impact
    const avgRoomRate = 120  // TODO: Get from database
    const potentialLostRevenue = lowDays.reduce((sum, d) => {
      const emptyRooms = d.roomsAvailable - d.roomsBooked
      return sum + (emptyRooms * avgRoomRate)
    }, 0)

    return {
      averageOccupancy: data.averageOccupancy,
      occupancyByDate: data.dates,
      lowOccupancyDays: lowDays.length,
      criticalOccupancyDays: criticalDays.length,
      highOccupancyDays: highDays.length,
      potentialLostRevenue,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      runAt: context.runAt.toISOString(),
    }
  }

  // ============================================
  // SYSTEM PROMPT - Define agent's reasoning
  // ============================================

  protected getSystemPrompt(): string {
    return `You are the Revenue Manager Agent for Abbey OS, a property estate management system.

Your responsibilities:
1. Monitor upcoming hotel occupancy
2. Identify periods of low occupancy that could benefit from promotional pricing
3. Propose appropriate discounts to stimulate demand
4. Queue all pricing changes for human approval

PRICING STRATEGY:
- Below ${this.LOW_OCCUPANCY_THRESHOLD}% occupancy: Consider 10% discount
- Below ${this.CRITICAL_OCCUPANCY_THRESHOLD}% occupancy: Consider 15% discount  
- Above ${this.HIGH_OCCUPANCY_THRESHOLD}% occupancy: Consider 5-10% rate increase

DECISION FACTORS TO CONSIDER:
1. How many days ahead is the low occupancy period?
2. Is it a typically slow period (mid-week, off-season)?
3. What's the potential revenue at risk?
4. Would a discount realistically attract more bookings?

CRITICAL RULES:
1. ALL pricing changes MUST be queued for approval
2. Never discount more than 20% without explicit owner approval
3. Consider the impact on brand perception
4. Log reasoning clearly for audit

Use applyDiscount to create a pricing proposal, or queueActionItem for general recommendations.`
  }

  // ============================================
  // USER PROMPT - Present observations
  // ============================================

  protected buildUserPrompt(observations: Record<string, unknown>): string {
    const avgOccupancy = observations.averageOccupancy as number || 0
    const lowDays = observations.lowOccupancyDays as number || 0
    const criticalDays = observations.criticalOccupancyDays as number || 0
    const highDays = observations.highOccupancyDays as number || 0
    const lostRevenue = observations.potentialLostRevenue as number || 0
    const dates = observations.occupancyByDate as Array<Record<string, unknown>> || []
    const startDate = observations.startDate as string
    const endDate = observations.endDate as string

    // If occupancy is healthy, no action needed
    if (avgOccupancy >= this.LOW_OCCUPANCY_THRESHOLD && lowDays === 0) {
      return `OCCUPANCY REPORT - ${observations.runAt}
Period: ${startDate} to ${endDate}

Average Occupancy: ${avgOccupancy}% ✅
High Occupancy Days: ${highDays}
Low Occupancy Days: 0

Occupancy levels are healthy. No pricing action required.

${highDays > 3 ? `
OPPORTUNITY: ${highDays} high-occupancy days detected. Consider a modest rate increase for these dates using queueActionItem.` : ''}

What action (if any) should we take?`
    }

    // Low occupancy detected
    let urgencyLevel = 'MODERATE'
    let suggestedDiscount = 10
    
    if (criticalDays > 0) {
      urgencyLevel = 'HIGH'
      suggestedDiscount = 15
    }

    const dateBreakdown = dates.map((d: any) => {
      const status = d.occupancy < 30 ? '🔴' : d.occupancy < 50 ? '🟡' : '✅'
      return `  ${d.date}: ${d.occupancy}% ${status} (${d.roomsBooked}/${d.roomsAvailable} rooms)`
    }).join('\n')

    return `OCCUPANCY REPORT - ${observations.runAt}
Period: ${startDate} to ${endDate}

⚠️ LOW OCCUPANCY ALERT - Urgency: ${urgencyLevel}

Average Occupancy: ${avgOccupancy}%
Days Below 50%: ${lowDays}
Days Below 30%: ${criticalDays}
Potential Lost Revenue: £${lostRevenue.toLocaleString()}

DAILY BREAKDOWN:
${dateBreakdown}

RECOMMENDATION:
Consider applying a ${suggestedDiscount}% discount for the low-occupancy period to stimulate bookings.

Estimated impact:
- Revenue reduction per booking: ~${suggestedDiscount}%
- Potential additional bookings: 2-4
- Net benefit if 3+ bookings gained: Positive

Should we propose a discount? Use applyDiscount with your recommended parameters.`
  }
}

// Export singleton instance
export const pricingAgent = new PricingAgent()

