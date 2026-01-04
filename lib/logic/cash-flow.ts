/**
 * Abbey OS - Global Cash Flow Calculator
 * Calculates "Monthly Sovereign Salary" (Net Profit)
 */

export interface CashFlowInputs {
  hotelLease: number // Monthly (£37.5k)
  carParkNormal: number // Monthly normal revenue (£2k)
  carParkEvent: number // Monthly event revenue (varies)
  userPortfolioValue: number // USD ($1.2M)
  userPortfolioYield: number // Annual percentage (8%)
}

export interface CashFlowOutputs {
  monthlyIncome: {
    hotelLease: number
    carPark: number
    userPortfolio: number
    total: number
  }
  monthlySovereignSalary: number // Net Profit
  annualProjection: number
  breakdown: {
    hotel: number
    carPark: number
    userPortfolio: number
  }
}

/**
 * Calculate monthly cash flow
 */
export function calculateGlobalCashFlow(
  inputs: CashFlowInputs
): CashFlowOutputs {
  // Hotel lease (already monthly)
  const hotelLease = inputs.hotelLease

  // Car park (normal + event)
  const carPark = inputs.carParkNormal + inputs.carParkEvent

  // User portfolio (convert USD to GBP, then calculate monthly yield)
  const userPortfolioGBP = inputs.userPortfolioValue * 0.79 // USD to GBP
  const annualYield = (userPortfolioGBP * inputs.userPortfolioYield) / 100
  const monthlyPortfolio = annualYield / 12

  const totalMonthly = hotelLease + carPark + monthlyPortfolio

  return {
    monthlyIncome: {
      hotelLease,
      carPark,
      userPortfolio: monthlyPortfolio,
      total: totalMonthly,
    },
    monthlySovereignSalary: totalMonthly, // Net profit (no expenses in this model)
    annualProjection: totalMonthly * 12,
    breakdown: {
      hotel: hotelLease,
      carPark,
      userPortfolio: monthlyPortfolio,
    },
  }
}

/**
 * Default cash flow inputs
 */
export const DEFAULT_CASH_FLOW_INPUTS: CashFlowInputs = {
  hotelLease: 37_500, // £37.5k/month = £450k/year
  carParkNormal: 2_000, // £2k/month normal
  carParkEvent: 0, // Varies based on events
  userPortfolioValue: 1_200_000, // $1.2M
  userPortfolioYield: 8, // 8% annual
}

