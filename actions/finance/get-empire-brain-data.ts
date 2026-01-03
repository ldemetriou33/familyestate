'use server'

import { prisma } from '@/lib/prisma'
import { getSONIAServerRate } from '@/lib/services/sonia-server'

export interface PropertyFinancials {
  id: string
  name: string
  type: string
  currentValue: number
  mortgageBalance: number
  mortgageRate: number
  termEndDate: Date | null
  penaltyFreeDate: Date | null
  mortgageLender: string | null
  mortgageType: string | null
  monthlyPayment: number
  rentalYield: number
  annualRevenue: number
  annualExpenses: number
}

export interface PortfolioMetrics {
  totalValue: number
  totalDebt: number
  ltv: number
  cashReserves: number
  monthlyNetIncome: number
  dscr: number
  occupancyLast3Months: number[]
  cafeNetMargin: number
}

/**
 * Get property financials for Empire Brain
 */
export async function getPropertyFinancials(): Promise<PropertyFinancials[]> {
  const properties = await prisma.property.findMany({
    include: {
      debts: {
        where: { loanType: 'MORTGAGE' },
        take: 1,
      },
      units: {
        include: {
          rentRolls: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  const soniaRate = await getSONIAServerRate()
  const marketRate = soniaRate + 1.5 // Typical spread

  const financials: PropertyFinancials[] = []

  for (const property of properties) {
    const mortgageDebt = property.debts[0]
    const mortgageBalance = mortgageDebt?.currentBalance || property.mortgageBalance || 0
    const mortgageRate = mortgageDebt?.interestRate || property.interestRate || property.mortgageRate || 0
    const monthlyPayment = mortgageDebt?.monthlyPayment || 0

    // Calculate rental income
    const monthlyRent = property.units
      .filter(u => u.status === 'OCCUPIED')
      .reduce((sum, u) => {
        const rent = u.rentRolls[0]?.monthlyRent || u.currentRate || 0
        return sum + rent
      }, 0)

    const annualRevenue = monthlyRent * 12
    const propertyValue = property.currentValue || property.purchasePrice || 0
    const rentalYield = propertyValue > 0 ? (annualRevenue / propertyValue) * 100 : 0

    // Estimate annual expenses (simplified - could be more sophisticated)
    const annualExpenses = monthlyPayment * 12 + (propertyValue * 0.02) // 2% maintenance estimate

    financials.push({
      id: property.id,
      name: property.name,
      type: property.type,
      currentValue: propertyValue,
      mortgageBalance,
      mortgageRate,
      termEndDate: property.mortgageTermEndDate,
      penaltyFreeDate: property.penaltyFreeDate,
      mortgageLender: property.mortgageLender,
      mortgageType: property.mortgageType,
      monthlyPayment,
      rentalYield,
      annualRevenue,
      annualExpenses,
    })
  }

  return financials
}

/**
 * Get portfolio metrics for Empire Brain
 */
export async function getPortfolioMetrics(): Promise<PortfolioMetrics> {
  const [properties, debts, cashPositions, hotelMetrics, cafeSales] = await Promise.all([
    prisma.property.findMany(),
    prisma.debt.findMany(),
    prisma.cashPosition.findMany({
      orderBy: { date: 'desc' },
      take: 1,
    }),
    prisma.hotelMetric.findMany({
      orderBy: { date: 'desc' },
      take: 90, // Last 3 months
    }),
    prisma.cafeSales.findMany({
      orderBy: { date: 'desc' },
      take: 30, // Last month
    }),
  ])

  const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice || 0), 0)
  const totalDebt = debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0)
  const ltv = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0

  const cashReserves = cashPositions[0]?.reserveBalance || 0

  // Get all units with their rent rolls
  const allUnits = await prisma.unit.findMany({
    where: { status: 'OCCUPIED' },
    include: {
      rentRolls: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  // Calculate monthly net income
  const monthlyRent = allUnits.reduce((sum, u) => {
    const rent = u.rentRolls[0]?.monthlyRent || u.currentRate || 0
    return sum + rent
  }, 0)

  const monthlyDebtService = debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0)
  const monthlyNetIncome = monthlyRent - monthlyDebtService

  // Calculate DSCR (simplified)
  const annualDebtService = monthlyDebtService * 12
  const annualIncome = monthlyRent * 12
  const dscr = annualDebtService > 0 ? annualIncome / annualDebtService : 0

  // Last 3 months occupancy (from hotel metrics)
  const occupancyLast3Months = []
  const now = new Date()
  for (let i = 2; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthMetrics = hotelMetrics.filter(m => {
      const metricDate = new Date(m.date)
      return metricDate >= monthStart && metricDate <= monthEnd
    })
    const avgOccupancy = monthMetrics.length > 0
      ? monthMetrics.reduce((sum, m) => sum + (m.occupancy || 0), 0) / monthMetrics.length
      : 0
    occupancyLast3Months.push(avgOccupancy)
  }

  // Cafe net margin (last month) - estimate from gross margin if available
  const cafeRevenue = cafeSales.reduce((sum, s) => sum + (s.grossSales || 0), 0)
  // Calculate costs from gross margin if available, otherwise estimate 60% cost ratio
  const cafeCosts = cafeSales.reduce((sum, s) => {
    if (s.grossMargin !== null && s.grossMargin !== undefined) {
      return sum + (s.grossSales || 0) * (1 - s.grossMargin / 100)
    }
    return sum + (s.grossSales || 0) * 0.6 // Default 60% cost ratio
  }, 0)
  const cafeNetMargin = cafeRevenue > 0 ? ((cafeRevenue - cafeCosts) / cafeRevenue) * 100 : 0

  return {
    totalValue,
    totalDebt,
    ltv,
    cashReserves,
    monthlyNetIncome,
    dscr,
    occupancyLast3Months,
    cafeNetMargin,
  }
}

