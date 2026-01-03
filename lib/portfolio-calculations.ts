// This file is deprecated - portfolio calculations now use server actions
// See: actions/portfolio/get-portfolio-metrics.ts

// Re-export types for backwards compatibility
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

// Re-export from server actions
export { calculatePortfolioMetrics, getRentalPropertiesWithPayments } from '@/actions/portfolio/get-portfolio-metrics'
