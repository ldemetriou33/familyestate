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

  // Fetch all data in parallel
  const [
    cashPosition,
    alerts,
    actionSummary,
    todayHotelMetric,
    todayCafeSales,
    rentRollStats,
    unitStats,
  ] = await Promise.all([
    // Cash position
    prisma.cashPosition.findFirst({
      orderBy: { date: 'desc' },
    }),

    // Active alerts (not dismissed)
    prisma.alert.findMany({
      where: { isDismissed: false },
      include: { property: { select: { name: true } } },
      orderBy: [
        { severity: 'asc' }, // CRITICAL first
        { createdAt: 'desc' },
      ],
      take: 10,
    }),

    // Action summary
    getDailyActionSummary(),

    // Today's hotel metrics (get most recent)
    prisma.hotelMetric.findFirst({
      where: { date: { gte: today } },
      orderBy: { date: 'desc' },
    }),

    // Today's cafe sales
    prisma.cafeSales.findFirst({
      where: { date: { gte: today } },
      orderBy: { date: 'desc' },
    }),

    // Rent roll aggregates
    prisma.rentRoll.aggregate({
      where: { isActive: true },
      _sum: {
        monthlyRent: true,
        arrearsAmount: true,
      },
      _count: {
        _all: true,
      },
    }),

    // Unit stats
    prisma.unit.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ])

  // Count arrears
  const arrearsCount = await prisma.rentRoll.count({
    where: {
      isActive: true,
      arrearsAmount: { gt: 0 },
    },
  })

  // Calculate unit stats
  type UnitStatGroup = { status: string; _count: { _all: number } }
  const totalUnits = (unitStats as UnitStatGroup[]).reduce((sum, s) => sum + s._count._all, 0)
  const occupiedUnits = (unitStats as UnitStatGroup[]).find(s => s.status === 'OCCUPIED')?._count._all || 0
  const vacantUnits = (unitStats as UnitStatGroup[]).find(s => s.status === 'VACANT')?._count._all || 0

  // Count critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length

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

    alerts: alerts.map(a => ({
      id: a.id,
      title: a.title,
      message: a.message,
      severity: a.severity,
      category: a.category,
      createdAt: a.createdAt,
      propertyName: a.property?.name || null,
    })),

    actionItems: actionSummary.pendingActions.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      priority: a.priority,
      status: a.status,
      category: a.category,
      estimatedImpactGbp: a.estimatedImpactGbp,
      dueDate: a.dueDate,
    })),

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
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })
}

