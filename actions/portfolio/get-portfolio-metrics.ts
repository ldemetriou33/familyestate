'use server'

import { prisma } from '@/lib/prisma'
import { calculateMonthlyMortgagePayment } from '@/lib/utils'
import { getSONIAServerRate } from '@/lib/services/sonia-server'
import { rentalProperties } from '@/lib/constants'

export interface PortfolioMetrics {
  totalLTV: number
  weightedAverageInterestRate: number
  monthlyCashflow: number
  totalPropertyValue: number
  totalMortgageBalance: number
  totalMonthlyRentalIncome: number
  totalMonthlyMortgagePayments: number
}

export interface PropertyWithPayments {
  id: string
  name: string
  location: string
  purchasePrice: number
  currentMortgageBalance: number
  currentInterestRate: number
  loanType: 'fixed' | 'variable'
  monthlyRentalIncome: number
  monthlyMortgagePayment: number
  monthlyCashflow: number
  ltv: number
  effectiveInterestRate: number
  totalMonthlyCosts: number
  netProfit: number
}

/**
 * Calculate portfolio metrics for residential rental properties
 * Uses SONIA rate for variable loans
 */
export async function calculatePortfolioMetrics(): Promise<PortfolioMetrics> {
  // If DATABASE_URL is not set, return mock data immediately
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set, returning mock portfolio metrics')
    return getMockPortfolioMetrics()
  }

  try {
    const soniaRate = await getSONIAServerRate()
    
    // Fetch residential properties with their debts and units
    const properties = await prisma.property.findMany({
      where: { type: 'RESIDENTIAL' },
      include: {
        debts: true,
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

  let totalPropertyValue = 0
  let totalMortgageBalance = 0
  let totalMonthlyRentalIncome = 0
  let totalMonthlyMortgagePayments = 0
  let totalInterestWeighted = 0

  // Calculate for each residential property
  for (const property of properties) {
    const propertyValue = property.currentValue || property.purchasePrice || 0
    totalPropertyValue += propertyValue

    // Get mortgage from debts or property fields
    const mortgageDebt = property.debts.find(d => d.loanType === 'MORTGAGE') || property.debts[0]
    const mortgageBalance = mortgageDebt?.currentBalance || property.mortgageBalance || 0
    const mortgageRate = mortgageDebt?.interestRate || property.interestRate || property.mortgageRate || 0
    const isVariable = property.mortgageType === 'VARIABLE' || property.mortgageType === 'TRACKER' || 
                      (mortgageDebt && !mortgageDebt.isFixed)
    
    totalMortgageBalance += mortgageBalance

    // Calculate rental income from units
    const propertyRentalIncome = property.units
      .filter(u => u.status === 'OCCUPIED')
      .reduce((sum, u) => {
        const rent = u.rentRolls[0]?.monthlyRent || u.currentRate || 0
        return sum + rent
      }, 0)
    totalMonthlyRentalIncome += propertyRentalIncome

    // Use SONIA rate for variable loans, otherwise use fixed rate
    const effectiveRate = isVariable ? soniaRate : mortgageRate

    // Calculate monthly mortgage payment
    if (mortgageBalance > 0) {
      const monthlyPayment = mortgageDebt?.monthlyPayment || calculateMonthlyMortgagePayment(
        mortgageBalance,
        effectiveRate,
        25 // Assuming 25-year mortgage term
      )
      totalMonthlyMortgagePayments += monthlyPayment

      // For weighted average: sum of (balance * rate)
      totalInterestWeighted += mortgageBalance * effectiveRate
    }
  }

  // Calculate LTV (Loan to Value)
  const totalLTV =
    totalPropertyValue > 0
      ? (totalMortgageBalance / totalPropertyValue) * 100
      : 0

  // Calculate weighted average interest rate
  const weightedAverageInterestRate =
    totalMortgageBalance > 0
      ? totalInterestWeighted / totalMortgageBalance
      : 0

    // Calculate monthly cashflow
    const monthlyCashflow = totalMonthlyRentalIncome - totalMonthlyMortgagePayments

    return {
      totalLTV,
      weightedAverageInterestRate,
      monthlyCashflow,
      totalPropertyValue,
      totalMortgageBalance,
      totalMonthlyRentalIncome,
      totalMonthlyMortgagePayments,
    }
  } catch (error) {
    console.error('Failed to calculate portfolio metrics:', error)
    // Return mock metrics from constants.ts as fallback
    console.log('Returning mock portfolio metrics as fallback')
    return getMockPortfolioMetrics()
  }
}

/**
 * Calculate mock portfolio metrics from constants.ts
 */
function getMockPortfolioMetrics(): PortfolioMetrics {
  const soniaRate = 5.25 // Approximate SONIA rate
  
  let totalPropertyValue = 0
  let totalMortgageBalance = 0
  let totalMonthlyRentalIncome = 0
  let totalMonthlyMortgagePayments = 0
  let totalInterestWeighted = 0

  for (const property of rentalProperties) {
    totalPropertyValue += property.purchasePrice
    totalMortgageBalance += property.currentMortgageBalance
    totalMonthlyRentalIncome += property.monthlyRentalIncome

    // Use SONIA rate for variable loans, otherwise use fixed rate
    const effectiveRate = property.loanType === 'variable' ? soniaRate : property.currentInterestRate

    // Calculate monthly mortgage payment
    if (property.currentMortgageBalance > 0) {
      const monthlyPayment = calculateMonthlyMortgagePayment(
        property.currentMortgageBalance,
        effectiveRate,
        25 // Assuming 25-year mortgage term
      )
      totalMonthlyMortgagePayments += monthlyPayment
      totalInterestWeighted += property.currentMortgageBalance * effectiveRate
    }
  }

  const totalLTV = totalPropertyValue > 0 ? (totalMortgageBalance / totalPropertyValue) * 100 : 0
  const weightedAverageInterestRate = totalMortgageBalance > 0 ? totalInterestWeighted / totalMortgageBalance : 0
  const monthlyCashflow = totalMonthlyRentalIncome - totalMonthlyMortgagePayments

  return {
    totalLTV,
    weightedAverageInterestRate,
    monthlyCashflow,
    totalPropertyValue,
    totalMortgageBalance,
    totalMonthlyRentalIncome,
    totalMonthlyMortgagePayments,
  }
}

/**
 * Get all rental properties with calculated mortgage payments
 * Uses SONIA rate for variable loans
 */
export async function getRentalPropertiesWithPayments(): Promise<PropertyWithPayments[]> {
  // If DATABASE_URL is not set, return mock data immediately
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set, returning mock rental properties')
    return getMockRentalPropertiesWithPayments()
  }

  try {
    const soniaRate = await getSONIAServerRate()
    
    // Fetch residential properties with their debts and units
    const properties = await prisma.property.findMany({
      where: { type: 'RESIDENTIAL' },
      include: {
        debts: true,
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

  return properties.map((property) => {
    // Get mortgage from debts or property fields
    const mortgageDebt = property.debts.find(d => d.loanType === 'MORTGAGE') || property.debts[0]
    const mortgageBalance = mortgageDebt?.currentBalance || property.mortgageBalance || 0
    const mortgageRate = mortgageDebt?.interestRate || property.interestRate || property.mortgageRate || 0
    const isVariable = property.mortgageType === 'VARIABLE' || property.mortgageType === 'TRACKER' || 
                      (mortgageDebt && !mortgageDebt.isFixed)
    
    // Use SONIA rate for variable loans
    const effectiveRate = isVariable ? soniaRate : mortgageRate

    // Calculate rental income from units
    const monthlyRentalIncome = property.units
      .filter(u => u.status === 'OCCUPIED')
      .reduce((sum, u) => {
        const rent = u.rentRolls[0]?.monthlyRent || u.currentRate || 0
        return sum + rent
      }, 0)

    const purchasePrice = property.purchasePrice || 0
    const monthlyMortgagePayment = mortgageDebt?.monthlyPayment || 
      (mortgageBalance > 0 ? calculateMonthlyMortgagePayment(mortgageBalance, effectiveRate, 25) : 0)

    // Calculate LTV
    const ltv = purchasePrice > 0 ? (mortgageBalance / purchasePrice) * 100 : 0

    // Calculate monthly cashflow
    const monthlyCashflow = monthlyRentalIncome - monthlyMortgagePayment

    // Map to PropertyWithPayments interface
    return {
      id: property.id,
      name: property.name,
      location: `${property.city}, ${property.postcode}`,
      purchasePrice,
      currentMortgageBalance: mortgageBalance,
      currentInterestRate: mortgageRate,
      loanType: isVariable ? 'variable' : 'fixed',
      monthlyRentalIncome,
      monthlyMortgagePayment,
      monthlyCashflow,
      ltv,
      effectiveInterestRate: effectiveRate,
      totalMonthlyCosts: monthlyMortgagePayment, // Simplified - could add maintenance/management fees
      netProfit: monthlyCashflow, // Simplified
    }
  })
  } catch (error) {
    console.error('Failed to get rental properties with payments:', error)
    // Return mock properties from constants.ts as fallback
    console.log('Returning mock rental properties as fallback')
    return getMockRentalPropertiesWithPayments()
  }
}

/**
 * Get mock rental properties from constants.ts
 */
function getMockRentalPropertiesWithPayments(): PropertyWithPayments[] {
  const soniaRate = 5.25 // Approximate SONIA rate

  return rentalProperties.map((property) => {
    const effectiveRate = property.loanType === 'variable' ? soniaRate : property.currentInterestRate
    const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
      property.currentMortgageBalance,
      effectiveRate,
      25
    )
    const ltv = property.purchasePrice > 0 ? (property.currentMortgageBalance / property.purchasePrice) * 100 : 0
    const monthlyCashflow = property.monthlyRentalIncome - monthlyMortgagePayment

    return {
      id: property.id,
      name: property.name,
      location: property.location,
      purchasePrice: property.purchasePrice,
      currentMortgageBalance: property.currentMortgageBalance,
      currentInterestRate: property.currentInterestRate,
      loanType: property.loanType,
      monthlyRentalIncome: property.monthlyRentalIncome,
      monthlyMortgagePayment,
      monthlyCashflow,
      ltv,
      effectiveInterestRate: effectiveRate,
      totalMonthlyCosts: monthlyMortgagePayment,
      netProfit: monthlyCashflow,
    }
  })
}

