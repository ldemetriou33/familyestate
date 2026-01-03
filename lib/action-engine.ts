// Abbey OS - Action Engine
// Background logic that runs after data ingestion to generate automated actions

import { prisma } from './db'

// Priority type (matches Prisma enum)
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

interface GeneratedAction {
  title: string
  description: string
  priority: Priority
  category: string
  estimatedImpactGbp: number
  dueDate: Date
  source: string
  sourceEntityType: string
  sourceEntityId: string
}

/**
 * Run all action generators after data ingestion
 */
export async function runActionEngine(): Promise<{
  generated: number
  actions: GeneratedAction[]
}> {
  const actions: GeneratedAction[] = []

  // Run all generators
  const arrearsActions = await generateArrearsActions()
  const cafeMarginActions = await detectCafeMarginSlip()
  const complianceActions = await detectExpiringCompliance()
  const occupancyActions = await detectLowOccupancy()

  actions.push(...arrearsActions, ...cafeMarginActions, ...complianceActions, ...occupancyActions)

  // Create action items in database
  for (const action of actions) {
    // Check if similar action already exists (avoid duplicates)
    const existing = await prisma.actionItem.findFirst({
      where: {
        source: action.source,
        sourceEntityType: action.sourceEntityType,
        sourceEntityId: action.sourceEntityId,
        workflowStatus: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS'] },
      },
    })

    if (!existing) {
      await prisma.actionItem.create({
        data: {
          title: action.title,
          description: action.description,
          priority: action.priority,
          workflowStatus: 'DRAFT',
          category: action.category,
          estimatedImpactGbp: action.estimatedImpactGbp,
          dueDate: action.dueDate,
          source: action.source,
          sourceEntityType: action.sourceEntityType,
          sourceEntityId: action.sourceEntityId,
        },
      })
    }
  }

  return {
    generated: actions.length,
    actions,
  }
}

/**
 * Scans RentRoll for arrears > 7 days and creates CRITICAL ActionItems
 */
export async function generateArrearsActions(): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = []

  const arrearsRolls = await prisma.rentRoll.findMany({
    where: {
      isActive: true,
      arrearsAmount: { gt: 0 },
      arrearsDays: { gt: 7 },
    },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
  })

  for (const roll of arrearsRolls) {
    const arrearsDays = roll.arrearsDays
    const priority: Priority = arrearsDays > 30 ? 'CRITICAL' : arrearsDays > 14 ? 'HIGH' : 'MEDIUM'
    
    actions.push({
      title: `Rent Arrears: ${roll.tenantName} - ${roll.unit.unitNumber}`,
      description: `${roll.tenantName} has £${roll.arrearsAmount.toLocaleString()} in arrears (${arrearsDays} days overdue). Property: ${roll.unit.property?.name || 'Unknown'}. Contact tenant and issue formal arrears notice if required.`,
      priority,
      category: 'Finance',
      estimatedImpactGbp: roll.arrearsAmount,
      dueDate: new Date(Date.now() + (priority === 'CRITICAL' ? 1 : 3) * 24 * 60 * 60 * 1000),
      source: 'SYSTEM',
      sourceEntityType: 'RENT_ROLL',
      sourceEntityId: roll.id,
    })
  }

  return actions
}

/**
 * Checks if CafeSales margin < 60% and creates HIGH priority ActionItem
 */
export async function detectCafeMarginSlip(): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = []
  const targetMargin = 60

  // Get last 7 days of cafe sales
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentSales = await prisma.cafeSales.findMany({
    where: {
      date: { gte: sevenDaysAgo },
    },
    include: {
      property: true,
    },
    orderBy: { date: 'desc' },
  })

  // Group by property and calculate average margin
  const propertyMargins = new Map<string, { total: number; count: number; propertyName: string; propertyId: string }>()

  for (const sale of recentSales) {
    if (sale.grossMargin) {
      const existing = propertyMargins.get(sale.propertyId) || { 
        total: 0, 
        count: 0, 
        propertyName: sale.property?.name || 'Unknown Cafe',
        propertyId: sale.propertyId,
      }
      existing.total += sale.grossMargin
      existing.count++
      propertyMargins.set(sale.propertyId, existing)
    }
  }

  for (const [propertyId, data] of propertyMargins) {
    const avgMargin = data.total / data.count
    
    if (avgMargin < targetMargin) {
      const marginGap = targetMargin - avgMargin
      // Estimate impact: 1% margin = ~£200/week revenue impact
      const estimatedImpact = marginGap * 200

      actions.push({
        title: `Cafe Margin Below Target: ${data.propertyName}`,
        description: `Average gross margin is ${avgMargin.toFixed(1)}% vs ${targetMargin}% target (${marginGap.toFixed(1)}% below). Review food costs, wastage, and supplier pricing. Consider menu price adjustments.`,
        priority: avgMargin < 50 ? 'CRITICAL' : 'HIGH',
        category: 'Operations',
        estimatedImpactGbp: estimatedImpact,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        source: 'SYSTEM',
        sourceEntityType: 'CAFE_SALES',
        sourceEntityId: propertyId,
      })
    }
  }

  return actions
}

/**
 * Detect documents expiring within 30 days
 */
export async function detectExpiringCompliance(): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = []
  
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const expiringDocs = await prisma.document.findMany({
    where: {
      expiryDate: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
    include: {
      property: true,
    },
  })

  for (const doc of expiringDocs) {
    const daysUntilExpiry = Math.ceil(
      (doc.expiryDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    const priority: Priority = daysUntilExpiry <= 7 ? 'CRITICAL' : daysUntilExpiry <= 14 ? 'HIGH' : 'MEDIUM'
    
    // Estimate penalty for non-compliance
    const estimatedImpact = doc.type === 'GAS_CERTIFICATE' ? 6000 : 
                            doc.type === 'ELECTRICAL_CERTIFICATE' ? 3000 : 
                            doc.type === 'EPC' ? 5000 : 1000

    actions.push({
      title: `${doc.type.replace(/_/g, ' ')} Expiring: ${doc.property?.name || 'Unknown'}`,
      description: `${doc.name} expires in ${daysUntilExpiry} days (${doc.expiryDate!.toLocaleDateString('en-GB')}). Book inspection/renewal immediately to maintain compliance.`,
      priority,
      category: 'Compliance',
      estimatedImpactGbp: estimatedImpact,
      dueDate: new Date(doc.expiryDate!.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before expiry
      source: 'SYSTEM',
      sourceEntityType: 'DOCUMENT',
      sourceEntityId: doc.id,
    })
  }

  return actions
}

/**
 * Detect low hotel occupancy and suggest promotions
 */
export async function detectLowOccupancy(): Promise<GeneratedAction[]> {
  const actions: GeneratedAction[] = []
  const targetOccupancy = 65

  // Get last 7 days of hotel metrics
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentMetrics = await prisma.hotelMetric.findMany({
    where: {
      date: { gte: sevenDaysAgo },
    },
    include: {
      property: true,
    },
  })

  // Group by property
  const propertyOccupancy = new Map<string, { 
    totalOccupancy: number
    count: number
    propertyName: string
    avgADR: number
    roomsAvailable: number
  }>()

  for (const metric of recentMetrics) {
    const existing = propertyOccupancy.get(metric.propertyId) || {
      totalOccupancy: 0,
      count: 0,
      propertyName: metric.property?.name || 'Unknown Hotel',
      avgADR: 0,
      roomsAvailable: metric.roomsAvailable,
    }
    existing.totalOccupancy += metric.occupancy
    existing.avgADR += metric.adr
    existing.count++
    propertyOccupancy.set(metric.propertyId, existing)
  }

  for (const [propertyId, data] of propertyOccupancy) {
    const avgOccupancy = data.totalOccupancy / data.count
    const avgADR = data.avgADR / data.count

    if (avgOccupancy < targetOccupancy) {
      const occupancyGap = targetOccupancy - avgOccupancy
      // Estimate lost revenue: gap% * rooms * ADR * 7 days
      const estimatedImpact = (occupancyGap / 100) * data.roomsAvailable * avgADR * 7

      actions.push({
        title: `Low Occupancy Alert: ${data.propertyName}`,
        description: `Average occupancy is ${avgOccupancy.toFixed(1)}% vs ${targetOccupancy}% target. Consider launching promotional rates, updating OTA listings, or targeted marketing campaign.`,
        priority: avgOccupancy < 50 ? 'HIGH' : 'MEDIUM',
        category: 'Marketing',
        estimatedImpactGbp: estimatedImpact,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        source: 'SYSTEM',
        sourceEntityType: 'HOTEL_METRIC',
        sourceEntityId: propertyId,
      })
    }
  }

  return actions
}

/**
 * Get daily action summary for Command Center
 */
export async function getDailyActionSummary() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [pendingActions, criticalCount, completedToday, totalImpact] = await Promise.all([
      // Get pending actions sorted by priority and impact
      prisma.actionItem.findMany({
        where: {
          workflowStatus: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS'] },
        },
        orderBy: [
          { priority: 'asc' }, // CRITICAL first
          { estimatedImpactGbp: 'desc' },
        ],
        take: 10,
      }).catch(() => []),

      // Count critical actions
      prisma.actionItem.count({
        where: {
          workflowStatus: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS'] },
          priority: 'CRITICAL',
        },
      }).catch(() => 0),

      // Count completed today (VERIFIED or EXECUTED)
      prisma.actionItem.count({
        where: {
          workflowStatus: { in: ['EXECUTED', 'VERIFIED'] },
          executedAt: { gte: today },
        },
      }).catch(() => 0),

      // Sum of pending impact
      prisma.actionItem.aggregate({
        where: {
          workflowStatus: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS'] },
        },
        _sum: {
          estimatedImpactGbp: true,
        },
      }).catch(() => ({ _sum: { estimatedImpactGbp: 0 } })),
    ])

    return {
      pendingActions: pendingActions || [],
      criticalCount: criticalCount || 0,
      completedToday: completedToday || 0,
      totalImpact: totalImpact._sum?.estimatedImpactGbp || 0,
    }
  } catch (error) {
    console.error('Error in getDailyActionSummary:', error)
    // Return empty summary on any error
    return {
      pendingActions: [],
      criticalCount: 0,
      completedToday: 0,
      totalImpact: 0,
    }
  }
}

