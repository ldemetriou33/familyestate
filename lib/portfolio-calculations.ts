import { rentalProperties, hotel, cafe, RentalProperty } from './constants'
import { calculateMonthlyMortgagePayment } from './utils'
import { getSONIAServerRate } from './services/sonia-server'

export interface PortfolioMetrics {
  totalLTV: number // Loan to Value across 12 rentals
  weightedAverageInterestRate: number
  monthlyCashflow: number // Rental income minus mortgage payments
  totalPropertyValue: number
  totalMortgageBalance: number
  totalMonthlyRentalIncome: number
  totalMonthlyMortgagePayments: number
}

export interface PropertyWithPayments extends RentalProperty {
  monthlyMortgagePayment: number
  monthlyCashflow: number
  ltv: number
  effectiveInterestRate: number // Uses SONIA for variable loans
  totalMonthlyCosts: number // Mortgage + maintenance + management
  netProfit: number // Rent - all costs
}

/**
 * Calculate portfolio metrics for the 12 rental properties
 * Uses SONIA rate for variable loans
 */
export async function calculatePortfolioMetrics(): Promise<PortfolioMetrics> {
  const soniaRate = await getSONIAServerRate()
  
  let totalPropertyValue = 0
  let totalMortgageBalance = 0
  let totalMonthlyRentalIncome = 0
  let totalMonthlyMortgagePayments = 0
  let totalInterestWeighted = 0

  // Calculate for 12 rental properties
  for (const property of rentalProperties) {
    totalPropertyValue += property.purchasePrice
    totalMortgageBalance += property.currentMortgageBalance
    totalMonthlyRentalIncome += property.monthlyRentalIncome

    // Use SONIA rate for variable loans, otherwise use fixed rate
    const effectiveRate = property.loanType === 'variable' 
      ? soniaRate 
      : property.currentInterestRate

    // Calculate monthly mortgage payment with effective rate
    const monthlyPayment = calculateMonthlyMortgagePayment(
      property.currentMortgageBalance,
      effectiveRate,
      25 // Assuming 25-year mortgage term
    )
    totalMonthlyMortgagePayments += monthlyPayment

    // For weighted average: sum of (balance * rate)
    totalInterestWeighted += property.currentMortgageBalance * effectiveRate
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
}

/**
 * Get all rental properties with calculated mortgage payments
 * Uses SONIA rate for variable loans
 */
export async function getRentalPropertiesWithPayments(): Promise<PropertyWithPayments[]> {
  const soniaRate = await getSONIAServerRate()
  
  return rentalProperties.map((property) => {
    // Use SONIA rate for variable loans
    const effectiveRate = property.loanType === 'variable' 
      ? soniaRate 
      : property.currentInterestRate

    const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
      property.currentMortgageBalance,
      effectiveRate,
      25
    )

    // Calculate management fee (percentage of rent)
    const managementFeeAmount = property.managementFee 
      ? (property.monthlyRentalIncome * property.managementFee) / 100
      : 0

    // Total monthly costs
    const totalMonthlyCosts = monthlyMortgagePayment + 
      (property.maintenanceFee || 0) + 
      managementFeeAmount

    // Net profit
    const netProfit = property.monthlyRentalIncome - totalMonthlyCosts

    const monthlyCashflow = property.monthlyRentalIncome - monthlyMortgagePayment
    const ltv = (property.currentMortgageBalance / property.purchasePrice) * 100

    return {
      ...property,
      monthlyMortgagePayment,
      monthlyCashflow,
      ltv,
      effectiveInterestRate: effectiveRate,
      totalMonthlyCosts,
      netProfit,
    }
  })
}
