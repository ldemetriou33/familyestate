/**
 * ABBEY OS - Energy & Grid Agent Tools
 * 
 * Tools for HVAC control, occupancy sync, and grid arbitrage
 */

import { AgentTool, ToolResult } from '../types'

// ============================================
// TYPES
// ============================================

interface RoomOccupancy {
  roomId: string
  roomNumber: string
  status: 'VACANT' | 'OCCUPIED' | 'ARRIVING_SOON' | 'DEPARTING_TODAY'
  guestName?: string
  checkInTime?: string
  checkOutTime?: string
  hoursUntilArrival?: number
  currentTemp?: number
  targetTemp?: number
  hvacMode?: string
}

interface HVACControlResult {
  roomId: string
  previousTemp: number
  newTemp: number
  previousMode: string
  newMode: string
  estimatedKwhSaved: number
  estimatedCostSaved: number
}

interface GridPriceData {
  currentPrice: number
  averagePrice: number
  isLowPrice: boolean
  isHighPrice: boolean
  nextLowPriceWindow?: string
  priceHistory: { time: string; price: number }[]
}

// ============================================
// TOOL A: SYNC OCCUPANCY
// ============================================

export const syncOccupancy: AgentTool = {
  name: 'syncOccupancy',
  description: 'Fetch live Check-In/Check-Out status from the Hotel PMS and correlate with room sensors',
  parameters: {
    propertyId: { type: 'string', description: 'Hotel property ID', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const { propertyId } = params as { propertyId?: string }
    
    console.log(`[Tool: syncOccupancy] Fetching occupancy for property: ${propertyId || 'all'}`)
    
    // Mock PMS data - in production, this would call Cloudbeds/Opera API
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    
    const mockRooms: RoomOccupancy[] = [
      {
        roomId: 'room-101',
        roomNumber: '101',
        status: 'OCCUPIED',
        guestName: 'Mr. Johnson',
        currentTemp: 21,
        targetTemp: 21,
        hvacMode: 'COMFORT',
      },
      {
        roomId: 'room-102',
        roomNumber: '102',
        status: 'VACANT',
        currentTemp: 19,
        targetTemp: 19,
        hvacMode: 'ECO',
      },
      {
        roomId: 'room-103',
        roomNumber: '103',
        status: 'VACANT',
        currentTemp: 22, // Too warm for vacant room!
        targetTemp: 21,
        hvacMode: 'COMFORT', // Should be ECO
      },
      {
        roomId: 'room-104',
        roomNumber: '104',
        status: 'ARRIVING_SOON',
        guestName: 'Ms. Williams',
        checkInTime: twoHoursFromNow.toISOString(),
        hoursUntilArrival: 2,
        currentTemp: 16, // Needs pre-heating!
        targetTemp: 16,
        hvacMode: 'ECO',
      },
      {
        roomId: 'room-105',
        roomNumber: '105',
        status: 'DEPARTING_TODAY',
        guestName: 'Mr. Brown',
        checkOutTime: now.toISOString(),
        currentTemp: 21,
        targetTemp: 21,
        hvacMode: 'COMFORT',
      },
      {
        roomId: 'room-106',
        roomNumber: '106',
        status: 'VACANT',
        currentTemp: 23, // Way too warm!
        targetTemp: 21,
        hvacMode: 'COMFORT', // Should be ECO
      },
    ]

    // Analyze rooms that need intervention
    const needsEcoMode = mockRooms.filter(r => 
      r.status === 'VACANT' && 
      r.currentTemp && r.currentTemp > 18 &&
      r.hvacMode !== 'ECO'
    )

    const needsPreHeat = mockRooms.filter(r =>
      r.status === 'ARRIVING_SOON' &&
      r.hoursUntilArrival && r.hoursUntilArrival <= 2 &&
      r.currentTemp && r.currentTemp < 20
    )

    const departingToday = mockRooms.filter(r => r.status === 'DEPARTING_TODAY')

    return {
      success: true,
      data: {
        totalRooms: mockRooms.length,
        occupied: mockRooms.filter(r => r.status === 'OCCUPIED').length,
        vacant: mockRooms.filter(r => r.status === 'VACANT').length,
        arrivingSoon: mockRooms.filter(r => r.status === 'ARRIVING_SOON').length,
        departingToday: departingToday.length,
        rooms: mockRooms,
        interventionsNeeded: {
          setToEco: needsEcoMode.map(r => ({
            roomNumber: r.roomNumber,
            roomId: r.roomId,
            currentTemp: r.currentTemp,
            reason: `Vacant room at ${r.currentTemp}°C, should be 16°C (Eco)`,
          })),
          preHeat: needsPreHeat.map(r => ({
            roomNumber: r.roomNumber,
            roomId: r.roomId,
            currentTemp: r.currentTemp,
            guestName: r.guestName,
            arrivingIn: `${r.hoursUntilArrival}h`,
            reason: `Guest arriving in ${r.hoursUntilArrival}h, room at ${r.currentTemp}°C, needs 21°C`,
          })),
        },
        timestamp: now.toISOString(),
      },
    }
  },
}

// ============================================
// TOOL B: CONTROL HVAC
// ============================================

export const controlHVAC: AgentTool = {
  name: 'controlHVAC',
  description: 'Set HVAC temperature and mode for a specific room',
  parameters: {
    roomId: { type: 'string', description: 'Room ID to control', required: true },
    targetTemp: { type: 'number', description: 'Target temperature in Celsius', required: true },
    mode: { type: 'string', description: 'HVAC mode: ECO, COMFORT, BOOST, OFF', required: true },
    reason: { type: 'string', description: 'Reason for the change', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    const { roomId, targetTemp, mode, reason } = params as { 
      roomId: string; targetTemp: number; mode: string; reason: string 
    }
    
    console.log(`[Tool: controlHVAC] Room ${roomId}: Set to ${targetTemp}°C (${mode}) - ${reason}`)
    
    // Mock current state - in production, query from RoomSensor table
    const mockCurrentState = {
      currentTemp: mode === 'ECO' ? 22 : 16, // Simulate temp we're changing from
      currentMode: mode === 'ECO' ? 'COMFORT' : 'ECO',
    }

    // Calculate energy savings estimate
    // Rough estimate: 3% energy saving per 1°C reduction
    const tempDelta = mockCurrentState.currentTemp - targetTemp
    const avgKwhPerHour = 2.5 // Average HVAC consumption
    const hoursUntilNextReview = 4 // Assuming 4 hours until next check
    const savingsPercent = Math.max(0, tempDelta * 0.03)
    const estimatedKwhSaved = tempDelta > 0 
      ? avgKwhPerHour * hoursUntilNextReview * savingsPercent 
      : 0
    const pricePerKwh = 0.28 // Average UK electricity price
    const estimatedCostSaved = estimatedKwhSaved * pricePerKwh

    // In production, this would call the smart home API
    // await hibeApi.setTemperature(roomId, targetTemp)
    // await hibeApi.setMode(roomId, mode)

    const result: HVACControlResult = {
      roomId,
      previousTemp: mockCurrentState.currentTemp,
      newTemp: targetTemp,
      previousMode: mockCurrentState.currentMode,
      newMode: mode,
      estimatedKwhSaved: Math.round(estimatedKwhSaved * 100) / 100,
      estimatedCostSaved: Math.round(estimatedCostSaved * 100) / 100,
    }

    return {
      success: true,
      data: {
        ...result,
        reason,
        timestamp: new Date().toISOString(),
        eventLogged: true,
      },
    }
  },
}

// ============================================
// TOOL C: GRID ARBITRAGE
// ============================================

export const gridArbitrage: AgentTool = {
  name: 'gridArbitrage',
  description: 'Check grid electricity prices and control high-consumption devices (immersion heaters, EV chargers) based on price',
  parameters: {
    action: { type: 'string', description: 'CHECK_PRICE, ENABLE_HEATING, DISABLE_HEATING', required: true },
    device: { type: 'string', description: 'Device type: IMMERSION_HEATER, EV_CHARGER, BATTERY_STORAGE', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const { action, device } = params as { action: string; device?: string }
    
    console.log(`[Tool: gridArbitrage] Action: ${action}, Device: ${device || 'all'}`)
    
    // Mock grid price data - in production, this would call Octopus/National Grid API
    const now = new Date()
    const mockPriceData: GridPriceData = {
      currentPrice: 0.08, // £0.08/kWh - cheap!
      averagePrice: 0.28,
      isLowPrice: true,
      isHighPrice: false,
      nextLowPriceWindow: '02:00-05:00',
      priceHistory: [
        { time: '00:00', price: 0.12 },
        { time: '04:00', price: 0.07 },
        { time: '08:00', price: 0.32 },
        { time: '12:00', price: 0.28 },
        { time: '16:00', price: 0.35 },
        { time: '20:00', price: 0.25 },
        { time: now.toTimeString().slice(0, 5), price: 0.08 },
      ],
    }

    if (action === 'CHECK_PRICE') {
      return {
        success: true,
        data: {
          ...mockPriceData,
          recommendation: mockPriceData.isLowPrice 
            ? 'Grid price is LOW - Consider enabling high-consumption devices'
            : mockPriceData.isHighPrice
            ? 'Grid price is HIGH - Minimize consumption'
            : 'Grid price is NORMAL',
          savingsOpportunity: mockPriceData.isLowPrice
            ? `Save £${((mockPriceData.averagePrice - mockPriceData.currentPrice) * 10).toFixed(2)} per 10kWh vs average price`
            : null,
        },
      }
    }

    if (action === 'ENABLE_HEATING' || action === 'DISABLE_HEATING') {
      const enabled = action === 'ENABLE_HEATING'
      const targetDevice = device || 'IMMERSION_HEATER'
      
      // Calculate arbitrage savings
      const runDurationHours = enabled ? 2 : 0 // Run for 2 hours during cheap period
      const powerKw = targetDevice === 'IMMERSION_HEATER' ? 3 : 7 // 3kW immersion, 7kW EV
      const kwhUsed = powerKw * runDurationHours
      const costAtCurrentPrice = kwhUsed * mockPriceData.currentPrice
      const costAtAveragePrice = kwhUsed * mockPriceData.averagePrice
      const savings = costAtAveragePrice - costAtCurrentPrice

      return {
        success: true,
        data: {
          device: targetDevice,
          action: enabled ? 'ENABLED' : 'DISABLED',
          gridPrice: mockPriceData.currentPrice,
          isArbitrageOpportunity: mockPriceData.isLowPrice,
          estimatedRuntime: enabled ? `${runDurationHours} hours` : 'N/A',
          estimatedKwh: enabled ? kwhUsed : 0,
          estimatedCost: enabled ? Math.round(costAtCurrentPrice * 100) / 100 : 0,
          savingsVsAverage: enabled ? Math.round(savings * 100) / 100 : 0,
          timestamp: now.toISOString(),
          eventLogged: true,
        },
      }
    }

    return {
      success: false,
      error: `Unknown action: ${action}`,
    }
  },
}

// ============================================
// TOOL D: GET ENERGY SUMMARY
// ============================================

export const getEnergySummary: AgentTool = {
  name: 'getEnergySummary',
  description: 'Get energy savings summary for today or a specific date range',
  parameters: {
    date: { type: 'string', description: 'Date to get summary for (YYYY-MM-DD), defaults to today', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const { date } = params as { date?: string }
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    console.log(`[Tool: getEnergySummary] Getting summary for: ${targetDate}`)
    
    // Mock summary data - in production, this would query EnergySummary table
    const mockSummary = {
      date: targetDate,
      totalKwhSaved: 45.2,
      totalCostSaved: 12.65,
      totalCo2Saved: 9.5, // kg
      interventions: {
        hvacEcoModeChanges: 8,
        hvacPreHeatChanges: 3,
        gridArbitrageEvents: 2,
      },
      roomsCurrentlyInEco: 4,
      avgTempReduction: 4.5, // °C
      peakSavingsHour: '14:00',
      comparisonToYesterday: {
        kwhDelta: 12.3,
        costDelta: 3.44,
        percentImprovement: 15,
      },
    }

    return {
      success: true,
      data: mockSummary,
    }
  },
}

// Export all energy tools
export const energyTools = {
  syncOccupancy,
  controlHVAC,
  gridArbitrage,
  getEnergySummary,
}

