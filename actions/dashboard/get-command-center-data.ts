'use server'

import { prisma } from '@/lib/db'
import { getDailyActionSummary } from '@/lib/action-engine'
import { getMockCommandCenterData } from '@/lib/mock-command-center-data'

export interface CommandCenterData {
  cashPosition: {
    operatingBalance: number
    reserveBalance: number
    totalBalance: number
    inflows: number
    outflows: number
    netMovement: number
    projected30Day: number | null
    projected90Day: number | null
  }
  alerts: {
    id: string
    title: string
    message: string
    severity: 'CRITICAL' | 'WARNING' | 'INFO'
    category: string
    createdAt: Date
    propertyName: string | null
  }[]
  actionItems: {
    id: string
    title: string
    description: string | null
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    status: string
    category: string | null
    estimatedImpactGbp: number | null
    dueDate: Date | null
  }[]
  metrics: {
    criticalAlerts: number
    pendingActions: number
    totalImpact: number
    completedToday: number
  }
  hotelMetrics: {
    occupancyRate: number
    adr: number
    revenueToday: number
    arrivals: number
    departures: number
  } | null
  cafeMetrics: {
    grossMargin: number
    salesToday: number
    coversToday: number
    labourPercentage: number
  } | null
  portfolioMetrics: {
    totalUnits: number
    occupiedUnits: number
    vacantUnits: number
    totalRentRoll: number
    totalArrears: number
    arrearsCount: number
  }
}

/**
 * Fetch all data needed for the Command Center
 */
export async function getCommandCenterData(): Promise<CommandCenterData> {
  // If DATABASE_URL is not set, return mock data immediately
  // This prevents Prisma proxy errors from breaking the build
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === '' || process.env.DATABASE_URL.includes('placeholder')) {
    console.log('DATABASE_URL not set or invalid, returning mock data')
    return getMockCommandCenterData()
  }

  // Wrap entire function in try-catch to catch any Prisma errors
  try {
    // Add a quick connection test with timeout
    const connectionTest = Promise.race([
      prisma.$queryRaw`SELECT 1`.catch(() => null),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000)),
    ]).catch(() => null)

    await connectionTest
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Try to use Prisma - if it fails, return mock data
    let cashPosition
    try {
      cashPosition = await prisma.cashPosition.findFirst({
        orderBy: { date: 'desc' },
      })
    } catch (err) {
      console.error('Error fetching cash position:', err)
      // If Prisma throws (e.g., proxy error), return mock data immediately
      if (err instanceof Error && err.message.includes('DATABASE_URL')) {
        return getMockCommandCenterData()
      }
      cashPosition = null
    }

    let alerts: Array<{
      id: string
      title: string
      message: string
      severity: string
      category: string
      createdAt: Date
      property: { name: string } | null
    }> = []
    try {
      alerts = await prisma.alert.findMany({
        where: { isDismissed: false },
        include: { property: { select: { name: true } } },
        orderBy: [
          { severity: 'asc' }, // CRITICAL first
          { createdAt: 'desc' },
        ],
        take: 10,
      })
    } catch (err) {
      console.error('Error fetching alerts:', err)
      if (err instanceof Error && err.message.includes('DATABASE_URL')) {
        return getMockCommandCenterData()
      }
      alerts = []
    }

    // Get action summary with error handling
    let actionSummary
    try {
      actionSummary = await getDailyActionSummary()
    } catch (error) {
      console.error('Failed to get action summary:', error)
      // Return empty action summary on error
      actionSummary = {
        pendingActions: [],
        totalImpact: 0,
        completedToday: 0,
      }
    }

    let todayHotelMetric: any = null
    let todayCafeSales: any = null
    let rentRollStats: any = { _sum: { monthlyRent: 0, arrearsAmount: 0 }, _count: { _all: 0 } }
    let unitStats: any[] = []
    let arrearsCount = 0
    
    try {
      todayHotelMetric = await prisma.hotelMetric.findFirst({
        where: { date: { gte: today } },
        orderBy: { date: 'desc' },
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('DATABASE_URL')) {
        return getMockCommandCenterData()
      }
      todayHotelMetric = null
    }

    try {
      todayCafeSales = await prisma.cafeSales.findFirst({
        where: { date: { gte: today } },
        orderBy: { date: 'desc' },
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('DATABASE_URL')) {
        return getMockCommandCenterData()
      }
      todayCafeSales = null
    }

    try {
      rentRollStats = await prisma.rentRoll.aggregate({
        where: { isActive: true },
        _sum: {
          monthlyRent: true,
          arrearsAmount: true,
        },
        _count: {
          _all: true,
        },
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('DATABASE_URL')) {
        return getMockCommandCenterData()
      }
      rentRollStats = { _sum: { monthlyRent: 0, arrearsAmount: 0 }, _count: { _all: 0 } }
    }

    try {
      // @ts-expect-error - Prisma proxy may not have correct types when DATABASE_URL is missing
      unitStats = await prisma.unit.groupBy({
        by: ['status'],
        _count: { _all: true },
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('DATABASE_URL')) {
        return getMockCommandCenterData()
      }
      unitStats = []
    }

    // Count arrears
    try {
      arrearsCount = await prisma.rentRoll.count({
        where: {
          isActive: true,
          arrearsAmount: { gt: 0 },
        },
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('DATABASE_URL')) {
        return getMockCommandCenterData()
      }
      arrearsCount = 0
    }

    // Calculate unit stats
    let totalUnits = 0
    let occupiedUnits = 0
    let vacantUnits = 0
    for (const stat of unitStats) {
      totalUnits += stat._count._all
      if (stat.status === 'OCCUPIED') occupiedUnits = stat._count._all
      if (stat.status === 'VACANT') vacantUnits = stat._count._all
    }

    // Count critical alerts
    let criticalAlerts = 0
    for (const alert of alerts) {
      if (alert.severity === 'CRITICAL') criticalAlerts++
    }

    return {
    cashPosition: {
      operatingBalance: cashPosition?.operatingBalance || 0,
      reserveBalance: cashPosition?.reserveBalance || 0,
      totalBalance: (cashPosition?.operatingBalance || 0) + (cashPosition?.reserveBalance || 0),
      inflows: cashPosition?.inflows || 0,
      outflows: cashPosition?.outflows || 0,
      netMovement: (cashPosition?.inflows || 0) - (cashPosition?.outflows || 0),
      projected30Day: cashPosition?.projected30Day || null,
      projected90Day: cashPosition?.projected90Day || null,
    },

    alerts: (() => {
      const result: CommandCenterData['alerts'] = []
      for (const a of alerts) {
        result.push({
          id: a.id,
          title: a.title,
          message: a.message,
          severity: a.severity as 'CRITICAL' | 'WARNING' | 'INFO',
          category: a.category,
          createdAt: a.createdAt,
          propertyName: a.property?.name || null,
        })
      }
      return result
    })(),

    actionItems: (() => {
      const result: CommandCenterData['actionItems'] = []
      for (const a of actionSummary.pendingActions) {
        result.push({
          id: a.id,
          title: a.title,
          description: a.description,
          priority: a.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
          status: a.workflowStatus,
          category: a.category,
          estimatedImpactGbp: a.estimatedImpactGbp,
          dueDate: a.dueDate,
        })
      }
      return result
    })(),

    metrics: {
      criticalAlerts,
      pendingActions: actionSummary.pendingActions.length,
      totalImpact: actionSummary.totalImpact,
      completedToday: actionSummary.completedToday,
    },

    hotelMetrics: todayHotelMetric ? {
      occupancyRate: todayHotelMetric.occupancy,
      adr: todayHotelMetric.adr,
      revenueToday: todayHotelMetric.totalRevenue,
      arrivals: todayHotelMetric.arrivals,
      departures: todayHotelMetric.departures,
    } : null,

    cafeMetrics: todayCafeSales ? {
      grossMargin: todayCafeSales.grossMargin || 0,
      salesToday: todayCafeSales.grossSales,
      coversToday: todayCafeSales.covers,
      labourPercentage: todayCafeSales.labourPercentage || 0,
    } : null,

    portfolioMetrics: {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      totalRentRoll: rentRollStats._sum.monthlyRent || 0,
      totalArrears: rentRollStats._sum.arrearsAmount || 0,
      arrearsCount,
    },
    }
  } catch (error) {
    console.error('Failed to get command center data:', error)
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    // Return mock data as fallback so dashboard still works
    console.log('Returning mock data as fallback')
    return getMockCommandCenterData()
  }
}

/**
 * Return empty command center data structure
 */
function getEmptyCommandCenterData(): CommandCenterData {
  return {
    cashPosition: {
      operatingBalance: 0,
      reserveBalance: 0,
      totalBalance: 0,
      inflows: 0,
      outflows: 0,
      netMovement: 0,
      projected30Day: null,
      projected90Day: null,
    },
    alerts: [],
    actionItems: [],
    metrics: {
      criticalAlerts: 0,
      pendingActions: 0,
      totalImpact: 0,
      completedToday: 0,
    },
    hotelMetrics: null,
    cafeMetrics: null,
    portfolioMetrics: {
      totalUnits: 0,
      occupiedUnits: 0,
      vacantUnits: 0,
      totalRentRoll: 0,
      totalArrears: 0,
      arrearsCount: 0,
    },
  }
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(alertId: string) {
  await prisma.alert.update({
    where: { id: alertId },
    data: { isDismissed: true },
  })
}

/**
 * Complete an action item
 */
export async function completeAction(actionId: string) {
  await prisma.actionItem.update({
    where: { id: actionId },
    data: {
      workflowStatus: 'EXECUTED',
      executedAt: new Date(),
    },
  })
}

