/**
 * Abbey OS - Global Cash Flow Calculator
 * Calculates "Monthly Sovereign Salary" (Net Profit)
 */

export interface CashFlowInputs {
  hotelLease: number // Monthly Triple Net Lease (£37.5k)
  cafeRoyalRevenue: number // Monthly revenue (£9.33k = £112k/year)
  carParkNormal: number // Monthly normal revenue (£2k)
  carParkEvent: number // Monthly event revenue (varies)
  userPortfolioValue: number // USD ($1.2M)
  userPortfolioYield: number // Annual percentage (8%)
}

export interface CashFlowOutputs {
  monthlyIncome: {
    hotelLease: number
    cafeRoyal: number
    carPark: number
    userPortfolio: number
    total: number
  }
  monthlySovereignSalary: number // Net Profit
  annualProjection: number
  breakdown: {
    hotel: number
    cafeRoyal: number
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
  // Hotel Triple Net Lease (already monthly)
  const hotelLease = inputs.hotelLease

  // Cafe Royal revenue (already monthly)
  const cafeRoyal = inputs.cafeRoyalRevenue

  // Car park (normal + event)
  const carPark = inputs.carParkNormal + inputs.carParkEvent

  // User portfolio (convert USD to GBP, then calculate monthly yield)
  const userPortfolioGBP = inputs.userPortfolioValue * 0.79 // USD to GBP
  const annualYield = (userPortfolioGBP * inputs.userPortfolioYield) / 100
  const monthlyPortfolio = annualYield / 12

  const totalMonthly = hotelLease + cafeRoyal + carPark + monthlyPortfolio

  return {
    monthlyIncome: {
      hotelLease,
      cafeRoyal,
      carPark,
      userPortfolio: monthlyPortfolio,
      total: totalMonthly,
    },
    monthlySovereignSalary: totalMonthly, // Net profit (no expenses in this model)
    annualProjection: totalMonthly * 12,
    breakdown: {
      hotel: hotelLease,
      cafeRoyal,
      carPark,
      userPortfolio: monthlyPortfolio,
    },
  }
}

/**
 * Default cash flow inputs
 */
export const DEFAULT_CASH_FLOW_INPUTS: CashFlowInputs = {
  hotelLease: 37_500, // £37.5k/month = £450k/year (Triple Net Lease)
  cafeRoyalRevenue: 9_333, // £9.33k/month = £112k/year (£72k flats + £40k cafe)
  carParkNormal: 2_000, // £2k/month normal
  carParkEvent: 0, // Varies based on events
  userPortfolioValue: 1_200_000, // $1.2M
  userPortfolioYield: 8, // 8% annual
}

