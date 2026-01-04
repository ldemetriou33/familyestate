/**
 * Abbey OS - Cash Flow Calculations
 * Global cash flow view with income and debt payments
 */

import type { Asset, CashFlowSummary, Revenue } from '@/lib/types/estate'

/**
 * Calculate monthly cash flow summary
 */
export function calculateCashFlow(
  assets: Asset[],
  userPortfolioValue: number = 1_200_000, // $1.2M
  userPortfolioYield: number = 0.08, // 8%
  cashBuffer: number = 0
): CashFlowSummary {
  let monthlyIncome = 0
  let monthlyDebtPayments = 0

  const breakdown: CashFlowSummary['breakdown'] = {}

  // Calculate income from assets
  for (const asset of assets) {
    for (const revenue of asset.revenues) {
      // Convert to GBP (simplified)
      const revenueGBP =
        revenue.currency === 'GBP'
          ? revenue.monthly_revenue
          : revenue.monthly_revenue * 0.85 // EUR to GBP

      monthlyIncome += revenueGBP

      // Categorize by revenue type
      switch (revenue.revenue_type) {
        case 'HOTEL':
          breakdown.hotel_noi = (breakdown.hotel_noi || 0) + revenueGBP
          break
        case 'RENTAL':
          breakdown.rental_income = (breakdown.rental_income || 0) + revenueGBP
          break
        case 'CAFE':
          breakdown.other_income = (breakdown.other_income || 0) + revenueGBP
          break
        default:
          breakdown.other_income = (breakdown.other_income || 0) + revenueGBP
      }
    }
  }

  // Add user portfolio yield (convert USD to GBP)
  const portfolioYieldMonthly = (userPortfolioValue * userPortfolioYield) / 12
  const portfolioYieldGBP = portfolioYieldMonthly * 0.79 // USD to GBP (rough)
  breakdown.portfolio_yield = portfolioYieldGBP
  monthlyIncome += portfolioYieldGBP

  // Calculate debt payments
  for (const asset of assets) {
    for (const debt of asset.debts) {
      if (debt.monthly_payment) {
        const paymentGBP =
          debt.currency === 'GBP'
            ? debt.monthly_payment
            : debt.monthly_payment * 0.85 // EUR to GBP
        monthlyDebtPayments += paymentGBP
      } else if (debt.type === 'INTEREST_ONLY') {
        // Calculate interest-only payment
        const annualInterest = debt.current_balance * (debt.interest_rate / 100)
        const monthlyInterest = annualInterest / 12
        const paymentGBP =
          debt.currency === 'GBP' ? monthlyInterest : monthlyInterest * 0.85
        monthlyDebtPayments += paymentGBP
      }
    }
  }

  const monthlyFreeCashFlow = monthlyIncome - monthlyDebtPayments
  const isPositive = monthlyFreeCashFlow > 0
  const warningThreshold = 50_000
  const hasWarning = cashBuffer < warningThreshold

  return {
    monthly_income: monthlyIncome,
    monthly_debt_payments: monthlyDebtPayments,
    monthly_free_cash_flow: monthlyFreeCashFlow,
    cash_buffer: cashBuffer,
    is_positive: isPositive,
    warning_threshold: warningThreshold,
    has_warning: hasWarning,
    breakdown,
  }
}

