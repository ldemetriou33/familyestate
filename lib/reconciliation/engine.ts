// Abbey OS - Reconciliation Engine
// Compares BankTx vs PMS Revenue vs POS Sales

import { prisma } from '@/lib/db'

export interface ReconciliationResult {
  id: string
  bankAmount: number
  sourceAmount: number
  variance: number
  variancePercent: number
  status: 'MATCHED' | 'UNMATCHED' | 'FLAGGED' | 'PENDING'
  sourceType: 'HotelMetric' | 'CafeSales' | 'LeasePayment'
  sourceId: string
  bankTxId: string | null
  date: Date
  notes: string
}

export interface ReconciliationSummary {
  periodStart: Date
  periodEnd: Date
  totalBankTx: number
  totalBankAmount: number
  totalSourceTx: number
  totalSourceAmount: number
  matchedCount: number
  matchedAmount: number
  unmatchedCount: number
  unmatchedAmount: number
  flaggedCount: number
  totalVariance: number
  matchRate: number
  items: ReconciliationResult[]
}

// Tolerance for matching (within £1 or 0.5%)
const MATCH_TOLERANCE_ABSOLUTE = 1.00
const MATCH_TOLERANCE_PERCENT = 0.005

/**
 * Run reconciliation for a given period
 */
export async function runReconciliation(
  periodStart: Date,
  periodEnd: Date,
  propertyId?: string
): Promise<ReconciliationSummary> {
  const items: ReconciliationResult[] = []
  
  // Fetch bank transactions for the period
  const bankTxs = await prisma.financialTransaction.findMany({
    where: {
      date: { gte: periodStart, lte: periodEnd },
      ...(propertyId && { propertyId }),
      category: { in: ['HOTEL_REVENUE', 'CAFE_REVENUE', 'RENT_INCOME'] },
    },
    orderBy: { date: 'asc' },
  })

  // Fetch hotel metrics for the period
  const hotelMetrics = await prisma.hotelMetric.findMany({
    where: {
      date: { gte: periodStart, lte: periodEnd },
      ...(propertyId && { propertyId }),
    },
    orderBy: { date: 'asc' },
  })

  // Fetch cafe sales for the period
  const cafeSales = await prisma.cafeSales.findMany({
    where: {
      date: { gte: periodStart, lte: periodEnd },
      ...(propertyId && { propertyId }),
    },
    orderBy: { date: 'asc' },
  })

  // Fetch lease payments for the period
  const leasePayments = await prisma.leasePayment.findMany({
    where: {
      paidDate: { gte: periodStart, lte: periodEnd },
      status: 'PAID',
    },
    include: {
      lease: {
        include: {
          unit: {
            include: { property: true }
          }
        }
      }
    },
    orderBy: { paidDate: 'asc' },
  })

  // Match hotel revenue
  for (const metric of hotelMetrics) {
    const matchingTx = bankTxs.find(tx => 
      tx.category === 'HOTEL_REVENUE' &&
      isSameDay(new Date(tx.date), new Date(metric.date))
    )

    const bankAmount = matchingTx?.amount || 0
    const sourceAmount = metric.totalRevenue
    const variance = Math.abs(bankAmount - sourceAmount)
    const variancePercent = sourceAmount > 0 ? variance / sourceAmount : 0

    const status = determineStatus(bankAmount, sourceAmount, variance, variancePercent)

    items.push({
      id: `hotel-${metric.id}`,
      bankAmount,
      sourceAmount,
      variance,
      variancePercent,
      status,
      sourceType: 'HotelMetric',
      sourceId: metric.id,
      bankTxId: matchingTx?.id || null,
      date: new Date(metric.date),
      notes: matchingTx 
        ? `Matched to bank tx ${matchingTx.reference || matchingTx.id}`
        : 'No matching bank transaction found',
    })

    // Update reconciliation status in database
    await prisma.hotelMetric.update({
      where: { id: metric.id },
      data: {
        reconciliationStatus: status,
        bankTxMatchedAmount: bankAmount,
        bankTxVariance: variance,
      },
    })
  }

  // Match cafe sales
  for (const sale of cafeSales) {
    const matchingTx = bankTxs.find(tx => 
      tx.category === 'CAFE_REVENUE' &&
      isSameDay(new Date(tx.date), new Date(sale.date))
    )

    const bankAmount = matchingTx?.amount || 0
    const sourceAmount = sale.grossSales
    const variance = Math.abs(bankAmount - sourceAmount)
    const variancePercent = sourceAmount > 0 ? variance / sourceAmount : 0

    const status = determineStatus(bankAmount, sourceAmount, variance, variancePercent)

    items.push({
      id: `cafe-${sale.id}`,
      bankAmount,
      sourceAmount,
      variance,
      variancePercent,
      status,
      sourceType: 'CafeSales',
      sourceId: sale.id,
      bankTxId: matchingTx?.id || null,
      date: new Date(sale.date),
      notes: matchingTx 
        ? `Matched to bank tx ${matchingTx.reference || matchingTx.id}`
        : 'No matching bank transaction found',
    })

    // Update reconciliation status in database
    await prisma.cafeSales.update({
      where: { id: sale.id },
      data: {
        reconciliationStatus: status,
        bankTxMatchedAmount: bankAmount,
        bankTxVariance: variance,
      },
    })
  }

  // Match lease payments
  for (const payment of leasePayments) {
    if (!payment.paidDate) continue

    const matchingTx = bankTxs.find(tx => 
      tx.category === 'RENT_INCOME' &&
      isSameDay(new Date(tx.date), new Date(payment.paidDate!)) &&
      Math.abs(tx.amount - payment.amount) < MATCH_TOLERANCE_ABSOLUTE
    )

    const bankAmount = matchingTx?.amount || 0
    const sourceAmount = payment.amount
    const variance = Math.abs(bankAmount - sourceAmount)
    const variancePercent = sourceAmount > 0 ? variance / sourceAmount : 0

    const status = determineStatus(bankAmount, sourceAmount, variance, variancePercent)

    items.push({
      id: `lease-${payment.id}`,
      bankAmount,
      sourceAmount,
      variance,
      variancePercent,
      status,
      sourceType: 'LeasePayment',
      sourceId: payment.id,
      bankTxId: matchingTx?.id || null,
      date: payment.paidDate,
      notes: matchingTx 
        ? `Matched to bank tx ${matchingTx.reference || matchingTx.id}`
        : 'No matching bank transaction found',
    })

    // Update reconciliation status in database
    await prisma.leasePayment.update({
      where: { id: payment.id },
      data: {
        reconciliationStatus: status,
        bankTxId: matchingTx?.id || null,
      },
    })
  }

  // Calculate summary
  const matchedItems = items.filter(i => i.status === 'MATCHED')
  const unmatchedItems = items.filter(i => i.status === 'UNMATCHED')
  const flaggedItems = items.filter(i => i.status === 'FLAGGED')

  const summary: ReconciliationSummary = {
    periodStart,
    periodEnd,
    totalBankTx: bankTxs.length,
    totalBankAmount: bankTxs.reduce((sum, tx) => sum + tx.amount, 0),
    totalSourceTx: items.length,
    totalSourceAmount: items.reduce((sum, i) => sum + i.sourceAmount, 0),
    matchedCount: matchedItems.length,
    matchedAmount: matchedItems.reduce((sum, i) => sum + i.sourceAmount, 0),
    unmatchedCount: unmatchedItems.length,
    unmatchedAmount: unmatchedItems.reduce((sum, i) => sum + i.sourceAmount, 0),
    flaggedCount: flaggedItems.length,
    totalVariance: items.reduce((sum, i) => sum + i.variance, 0),
    matchRate: items.length > 0 ? (matchedItems.length / items.length) * 100 : 0,
    items,
  }

  // Create reconciliation run record
  await prisma.reconciliationRun.create({
    data: {
      periodStart,
      periodEnd,
      propertyId,
      totalBankTx: summary.totalBankTx,
      totalPmsTx: hotelMetrics.length,
      totalPosTx: cafeSales.length,
      matchedCount: summary.matchedCount,
      unmatchedCount: summary.unmatchedCount,
      flaggedCount: summary.flaggedCount,
      totalVariance: summary.totalVariance,
      completedAt: new Date(),
    },
  })

  return summary
}

/**
 * Determine reconciliation status based on amounts
 */
function determineStatus(
  bankAmount: number,
  sourceAmount: number,
  variance: number,
  variancePercent: number
): 'MATCHED' | 'UNMATCHED' | 'FLAGGED' | 'PENDING' {
  // No bank transaction found
  if (bankAmount === 0) {
    return 'UNMATCHED'
  }

  // Perfect match or within tolerance
  if (variance <= MATCH_TOLERANCE_ABSOLUTE || variancePercent <= MATCH_TOLERANCE_PERCENT) {
    return 'MATCHED'
  }

  // Significant variance - flag for review
  if (variancePercent > 0.05) { // More than 5% variance
    return 'FLAGGED'
  }

  // Small variance - still matched but noted
  return 'MATCHED'
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Get reconciliation summary for dashboard
 */
export async function getReconciliationDashboard() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get recent reconciliation runs
  const recentRuns = await prisma.reconciliationRun.findMany({
    orderBy: { runDate: 'desc' },
    take: 5,
  })

  // Get unmatched counts by type
  const unmatchedHotel = await prisma.hotelMetric.count({
    where: {
      reconciliationStatus: 'UNMATCHED',
      date: { gte: thirtyDaysAgo },
    },
  })

  const unmatchedCafe = await prisma.cafeSales.count({
    where: {
      reconciliationStatus: 'UNMATCHED',
      date: { gte: thirtyDaysAgo },
    },
  })

  const unmatchedRent = await prisma.leasePayment.count({
    where: {
      reconciliationStatus: 'UNMATCHED',
      paidDate: { gte: thirtyDaysAgo },
    },
  })

  // Get flagged items
  const flaggedHotel = await prisma.hotelMetric.count({
    where: {
      reconciliationStatus: 'FLAGGED',
      date: { gte: thirtyDaysAgo },
    },
  })

  const flaggedCafe = await prisma.cafeSales.count({
    where: {
      reconciliationStatus: 'FLAGGED',
      date: { gte: thirtyDaysAgo },
    },
  })

  return {
    recentRuns,
    unmatched: {
      hotel: unmatchedHotel,
      cafe: unmatchedCafe,
      rent: unmatchedRent,
      total: unmatchedHotel + unmatchedCafe + unmatchedRent,
    },
    flagged: {
      hotel: flaggedHotel,
      cafe: flaggedCafe,
      total: flaggedHotel + flaggedCafe,
    },
    lastRunDate: recentRuns[0]?.runDate || null,
    overallMatchRate: recentRuns.length > 0
      ? recentRuns.reduce((sum, r) => {
          const total = r.matchedCount + r.unmatchedCount + r.flaggedCount
          return sum + (total > 0 ? (r.matchedCount / total) * 100 : 0)
        }, 0) / recentRuns.length
      : 0,
  }
}

/**
 * Force match a transaction
 */
export async function forceMatchTransaction(
  sourceType: 'HotelMetric' | 'CafeSales' | 'LeasePayment',
  sourceId: string,
  bankTxId: string,
  notes: string
) {
  switch (sourceType) {
    case 'HotelMetric':
      await prisma.hotelMetric.update({
        where: { id: sourceId },
        data: { reconciliationStatus: 'FORCE_MATCHED' },
      })
      break
    case 'CafeSales':
      await prisma.cafeSales.update({
        where: { id: sourceId },
        data: { reconciliationStatus: 'FORCE_MATCHED' },
      })
      break
    case 'LeasePayment':
      await prisma.leasePayment.update({
        where: { id: sourceId },
        data: { 
          reconciliationStatus: 'FORCE_MATCHED',
          bankTxId,
        },
      })
      break
  }

  // Update bank transaction
  await prisma.financialTransaction.update({
    where: { id: bankTxId },
    data: {
      reconciliationStatus: 'FORCE_MATCHED',
      matchedToType: sourceType,
      matchedToId: sourceId,
      reconciledAt: new Date(),
    },
  })
}

