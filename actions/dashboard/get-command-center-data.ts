'use server'

import { prisma } from '@/lib/db'
import { getDailyActionSummary } from '@/lib/action-engine'

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
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fetch data (separate queries for proper type inference)
  const cashPosition = await prisma.cashPosition.findFirst({
    orderBy: { date: 'desc' },
  })

  const alerts = await prisma.alert.findMany({
    where: { isDismissed: false },
    include: { property: { select: { name: true } } },
    orderBy: [
      { severity: 'asc' }, // CRITICAL first
      { createdAt: 'desc' },
    ],
    take: 10,
  })

  const actionSummary = await getDailyActionSummary()

  const todayHotelMetric = await prisma.hotelMetric.findFirst({
    where: { date: { gte: today } },
    orderBy: { date: 'desc' },
  })

  const todayCafeSales = await prisma.cafeSales.findFirst({
    where: { date: { gte: today } },
    orderBy: { date: 'desc' },
  })

  const rentRollStats = await prisma.rentRoll.aggregate({
    where: { isActive: true },
    _sum: {
      monthlyRent: true,
      arrearsAmount: true,
    },
    _count: {
      _all: true,
    },
  })

  const unitStats = await prisma.unit.groupBy({
    by: ['status'],
    _count: { _all: true },
  })

  // Count arrears
  const arrearsCount = await prisma.rentRoll.count({
    where: {
      isActive: true,
      arrearsAmount: { gt: 0 },
    },
  })

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

