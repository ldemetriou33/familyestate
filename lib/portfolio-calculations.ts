import { rentalProperties, hotel, cafe } from './constants'
import { calculateMonthlyMortgagePayment } from './utils'

export interface PortfolioMetrics {
  totalLTV: number // Loan to Value across 12 rentals
  weightedAverageInterestRate: number
  monthlyCashflow: number // Rental income minus mortgage payments
  totalPropertyValue: number
  totalMortgageBalance: number
  totalMonthlyRentalIncome: number
  totalMonthlyMortgagePayments: number
}

/**
 * Calculate portfolio metrics for the 12 rental properties
 */
export function calculatePortfolioMetrics(): PortfolioMetrics {
  let totalPropertyValue = 0
  let totalMortgageBalance = 0
  let totalMonthlyRentalIncome = 0
  let totalMonthlyMortgagePayments = 0
  let totalInterestWeighted = 0

  // Calculate for 12 rental properties
  rentalProperties.forEach((property) => {
    totalPropertyValue += property.purchasePrice
    totalMortgageBalance += property.currentMortgageBalance
    totalMonthlyRentalIncome += property.monthlyRentalIncome

    // Calculate monthly mortgage payment for each property
    const monthlyPayment = calculateMonthlyMortgagePayment(
      property.currentMortgageBalance,
      property.currentInterestRate,
      25 // Assuming 25-year mortgage term
    )
    totalMonthlyMortgagePayments += monthlyPayment

    // For weighted average: sum of (balance * rate)
    totalInterestWeighted +=
      property.currentMortgageBalance * property.currentInterestRate
  })

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
}

/**
 * Get all rental properties with calculated mortgage payments
 */
export function getRentalPropertiesWithPayments() {
  return rentalProperties.map((property) => {
    const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
      property.currentMortgageBalance,
      property.currentInterestRate,
      25
    )
    const monthlyCashflow = property.monthlyRentalIncome - monthlyMortgagePayment
    const ltv = (property.currentMortgageBalance / property.purchasePrice) * 100

    return {
      ...property,
      monthlyMortgagePayment,
      monthlyCashflow,
      ltv,
    }
  })
}

