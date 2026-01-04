/**
 * Abbey OS - Shadow Equity Calculator
 * Tracks debt-to-equity conversion with interest capitalization
 */

import type { ShadowEquity } from '@/lib/types/estate'

/**
 * Calculate monthly interest accrual for shadow equity
 */
export function calculateMonthlyShadowEquity(
  loanAmount: number,
  interestRate: number,
  monthsElapsed: number = 0
): {
  monthlyAccrual: number
  totalShadowEquity: number
} {
  const monthlyRate = interestRate / 100 / 12
  const monthlyAccrual = loanAmount * monthlyRate

  // Compound interest calculation
  const totalShadowEquity = loanAmount * (Math.pow(1 + monthlyRate, monthsElapsed) - 1)

  return {
    monthlyAccrual,
    totalShadowEquity,
  }
}

/**
 * Update shadow equity with monthly capitalization
 */
export function updateShadowEquity(
  currentShadowEquity: ShadowEquity,
  monthsToAdd: number = 1
): ShadowEquity {
  const { monthlyAccrual, totalShadowEquity } = calculateMonthlyShadowEquity(
    currentShadowEquity.loan_amount,
    currentShadowEquity.interest_rate,
    monthsToAdd
  )

  return {
    ...currentShadowEquity,
    monthly_interest_accrual: monthlyAccrual,
    current_shadow_equity: currentShadowEquity.current_shadow_equity + totalShadowEquity,
  }
}

/**
 * Calculate what percentage of entity the shadow equity represents
 */
export function calculateShadowEquityOwnership(
  shadowEquity: ShadowEquity,
  entityTotalValue: number
): number {
  // Convert shadow equity to entity currency (simplified)
  const shadowEquityInEntityCurrency =
    shadowEquity.currency === 'GBP'
      ? shadowEquity.current_shadow_equity
      : shadowEquity.current_shadow_equity * 0.79 // USD to GBP

  return (shadowEquityInEntityCurrency / entityTotalValue) * 100
}

