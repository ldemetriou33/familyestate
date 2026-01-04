/**
 * Abbey OS - Oakwood Decay Tracker
 * Calculates compound interest accrual on equity release
 */

import type { Asset, Debt, OakwoodDecay } from '@/lib/types/estate'

/**
 * Calculate Oakwood Decay metrics
 */
export function calculateOakwoodDecay(asset: Asset, debt: Debt): OakwoodDecay {
  if (!debt.is_compound) {
    throw new Error('Debt must be compound interest for Oakwood Decay calculation')
  }

  const currentEquity = asset.valuation - debt.current_balance
  const interestRate = debt.interest_rate / 100 // Convert to decimal
  const dailyRate = interestRate / 365

  // Daily interest accrual (compound)
  const dailyInterestAccrual = debt.current_balance * dailyRate

  // Calculate years until equity reaches zero
  // Using compound interest formula: A = P(1 + r)^t
  // Solving for t: t = log(A/P) / log(1 + r)
  // Where A = asset valuation (when debt equals asset value)
  // P = current debt balance
  // r = annual interest rate

  let yearsUntilZero = 0
  if (dailyInterestAccrual > 0 && currentEquity > 0) {
    // Simplified calculation: years = equity / (debt * annual_rate)
    yearsUntilZero = currentEquity / (debt.current_balance * interestRate)
  }

  // Monthly decay (approximate)
  const monthlyDecay = dailyInterestAccrual * 30

  // Determine alert level
  let alertLevel: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE'
  if (yearsUntilZero < 5) {
    alertLevel = 'CRITICAL'
  } else if (yearsUntilZero < 10) {
    alertLevel = 'WARNING'
  }

  return {
    asset_id: asset.id,
    current_equity: currentEquity,
    debt_balance: debt.current_balance,
    interest_rate: debt.interest_rate,
    daily_interest_accrual: dailyInterestAccrual,
    years_until_zero: yearsUntilZero,
    monthly_decay: monthlyDecay,
    alert_level: alertLevel,
  }
}

/**
 * Calculate projected equity at a future date
 */
export function projectEquityAtDate(
  currentEquity: number,
  debtBalance: number,
  interestRate: number,
  yearsFromNow: number
): number {
  const annualRate = interestRate / 100
  const futureDebt = debtBalance * Math.pow(1 + annualRate, yearsFromNow)
  // Assuming asset value stays constant (simplified)
  const assetValue = currentEquity + debtBalance
  return Math.max(0, assetValue - futureDebt)
}

