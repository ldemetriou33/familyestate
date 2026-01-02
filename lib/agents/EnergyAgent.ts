/**
 * ABBEY OS - Multi-Agent Architecture
 * EnergyAgent
 * 
 * Role: Reduce Hotel utility costs by syncing HVAC states with PMS Occupancy data
 * 
 * Trigger: Every 15 minutes via Vercel Cron
 * 
 * Tools:
 *   A. syncOccupancy - Fetch live Check-In/Check-Out status from PMS
 *   B. controlHVAC - Set room temperatures based on occupancy
 *   C. gridArbitrage - Enable high-consumption devices during low price periods
 * 
 * Logic:
 *   - VACANT room + Temp > 18°C → Set to 16°C (Eco Mode)
 *   - ARRIVING_SOON (< 2hrs) + Temp < 20°C → Set to 21°C (Comfort Mode)
 *   - Grid Price < £0.10/kWh → Enable immersion heater for hot water
 */

import { BaseAgent } from './BaseAgent'
import { AgentRunContext } from './types'
import { 
  syncOccupancy, 
  controlHVAC, 
  gridArbitrage, 
  getEnergySummary 
} from './tools/energy-tools'
import { queueActionItem } from './tools'

// Constants for HVAC control
const ECO_TEMP = 16        // Temperature for vacant rooms
const COMFORT_TEMP = 21    // Temperature for occupied/arriving rooms
const VACANT_THRESHOLD = 18 // Above this, vacant rooms need intervention
const PREHEAT_THRESHOLD = 20 // Below this, arriving rooms need preheating
const LOW_GRID_PRICE = 0.10  // £/kWh - below this, enable arbitrage

export class EnergyAgent extends BaseAgent {
  constructor() {
    super(
      'energy-agent-001',
      'MaintenanceManager', // Using existing role for now
      'Reduces utility costs by syncing HVAC with occupancy and performing grid arbitrage',
      { approvalThreshold: 0.6 } // Lower threshold - energy actions are generally safe
    )

    // Register tools this agent can use
    this.registerTool(syncOccupancy)
    this.registerTool(controlHVAC)
    this.registerTool(gridArbitrage)
    this.registerTool(getEnergySummary)
    this.registerTool(queueActionItem)
  }

  // ============================================
  // OBSERVE - Gather occupancy and grid data
  // ============================================

  protected async observe(context: AgentRunContext): Promise<Record<string, unknown>> {
    console.log(`[EnergyAgent] Observing occupancy and grid state...`)

    // Fetch current occupancy status
    const occupancyTool = this.getTool('syncOccupancy')
    const gridTool = this.getTool('gridArbitrage')
    const summaryTool = this.getTool('getEnergySummary')

    if (!occupancyTool || !gridTool || !summaryTool) {
      return { error: 'Required tools not found' }
    }

    // Get occupancy data
    const occupancyResult = await occupancyTool.execute({})
    if (!occupancyResult.success) {
      return { error: occupancyResult.error, occupancy: null }
    }

    // Get grid price data
    const gridResult = await gridTool.execute({ action: 'CHECK_PRICE' })
    
    // Get today's savings summary
    const summaryResult = await summaryTool.execute({})

    const occupancy = occupancyResult.data as any
    const grid = gridResult.success ? gridResult.data as any : null
    const summary = summaryResult.success ? summaryResult.data as any : null

    return {
      occupancy,
      grid,
      summary,
      interventionsNeeded: occupancy?.interventionsNeeded || { setToEco: [], preHeat: [] },
      gridArbitrageOpportunity: grid?.isLowPrice && grid?.currentPrice < LOW_GRID_PRICE,
      currentGridPrice: grid?.currentPrice,
      runAt: context.runAt.toISOString(),
    }
  }

  // ============================================
  // SYSTEM PROMPT - Define agent's reasoning
  // ============================================

  protected getSystemPrompt(): string {
    return `You are the Energy & Grid Agent for Abbey OS, a hotel and property management system.

Your mission is to REDUCE UTILITY COSTS by intelligently controlling HVAC systems and taking advantage of cheap electricity prices.

HVAC CONTROL RULES:
1. VACANT rooms with temperature > ${VACANT_THRESHOLD}°C → Use controlHVAC to set to ${ECO_TEMP}°C (ECO mode)
2. ARRIVING_SOON rooms (guest within 2 hours) with temp < ${PREHEAT_THRESHOLD}°C → Use controlHVAC to set to ${COMFORT_TEMP}°C (COMFORT mode)
3. Never reduce temperature of OCCUPIED rooms
4. After checkout (DEPARTING_TODAY), wait 30 mins for housekeeping before setting to ECO

GRID ARBITRAGE RULES:
1. If grid price < £${LOW_GRID_PRICE}/kWh → Use gridArbitrage to ENABLE immersion heater
2. If grid price > £0.30/kWh → Use gridArbitrage to DISABLE high-consumption devices
3. Prioritize storing heat/hot water during cheap periods

PRIORITY ORDER:
1. First, handle any rooms that need ECO mode (biggest savings)
2. Second, pre-heat rooms for arriving guests (guest comfort)
3. Third, check grid arbitrage opportunities
4. Finally, log summary of actions taken

IMPORTANT:
- You can execute multiple HVAC changes in one run
- Log estimated kWh and cost savings for each action
- Be conservative - guest comfort is priority #1 for occupied rooms`
  }

  // ============================================
  // USER PROMPT - Present observations
  // ============================================

  protected buildUserPrompt(observations: Record<string, unknown>): string {
    const occupancy = observations.occupancy as any
    const grid = observations.grid as any
    const summary = observations.summary as any
    const interventions = observations.interventionsNeeded as any
    const hasGridOpportunity = observations.gridArbitrageOpportunity as boolean

    if (observations.error) {
      return `Error fetching data: ${observations.error}

No action can be taken without occupancy data.`
    }

    let prompt = `ENERGY AGENT RUN - ${observations.runAt}

📊 TODAY'S SAVINGS SO FAR:
- Energy Saved: ${summary?.totalKwhSaved || 0} kWh
- Cost Saved: £${summary?.totalCostSaved?.toFixed(2) || '0.00'}
- CO2 Saved: ${summary?.totalCo2Saved || 0} kg
- HVAC Interventions: ${summary?.interventions?.hvacEcoModeChanges || 0}

🏨 CURRENT OCCUPANCY:
- Total Rooms: ${occupancy?.totalRooms || 0}
- Occupied: ${occupancy?.occupied || 0}
- Vacant: ${occupancy?.vacant || 0}
- Arriving Soon: ${occupancy?.arrivingSoon || 0}
- Departing Today: ${occupancy?.departingToday || 0}

`

    // Rooms needing ECO mode
    if (interventions?.setToEco?.length > 0) {
      prompt += `⚠️ VACANT ROOMS NEEDING ECO MODE (${interventions.setToEco.length}):
${interventions.setToEco.map((r: any) => `  - Room ${r.roomNumber}: Currently ${r.currentTemp}°C → Should be ${ECO_TEMP}°C`).join('\n')}

ACTION REQUIRED: Use controlHVAC to set each room to ${ECO_TEMP}°C ECO mode.

`
    }

    // Rooms needing pre-heat
    if (interventions?.preHeat?.length > 0) {
      prompt += `🔥 ROOMS NEEDING PRE-HEAT (${interventions.preHeat.length}):
${interventions.preHeat.map((r: any) => `  - Room ${r.roomNumber}: ${r.guestName} arriving in ${r.arrivingIn}, currently ${r.currentTemp}°C → Need ${COMFORT_TEMP}°C`).join('\n')}

ACTION REQUIRED: Use controlHVAC to set each room to ${COMFORT_TEMP}°C COMFORT mode.

`
    }

    // Grid arbitrage
    if (grid) {
      prompt += `⚡ GRID STATUS:
- Current Price: £${grid.currentPrice?.toFixed(3) || 'N/A'}/kWh
- Average Price: £${grid.averagePrice?.toFixed(3) || 'N/A'}/kWh
- Status: ${grid.isLowPrice ? '🟢 LOW PRICE - Arbitrage opportunity!' : grid.isHighPrice ? '🔴 HIGH PRICE - Minimize usage' : '🟡 NORMAL'}

`
      if (hasGridOpportunity) {
        prompt += `ACTION AVAILABLE: Grid price is below £${LOW_GRID_PRICE}/kWh. Consider using gridArbitrage to enable immersion heater for cheap hot water storage.

`
      }
    }

    // No interventions needed
    if ((!interventions?.setToEco || interventions.setToEco.length === 0) && 
        (!interventions?.preHeat || interventions.preHeat.length === 0) &&
        !hasGridOpportunity) {
      prompt += `✅ NO INTERVENTIONS NEEDED
All rooms are at optimal temperatures. No grid arbitrage opportunities.

Set suggestedAction to null.`
    } else {
      prompt += `Process the interventions in priority order:
1. First, set vacant rooms to ECO mode (biggest savings)
2. Then, pre-heat rooms for arriving guests
3. Finally, handle grid arbitrage if opportunity exists

Start with the first intervention. What action should we take?`
    }

    return prompt
  }
}

// Export singleton instance
export const energyAgent = new EnergyAgent()

