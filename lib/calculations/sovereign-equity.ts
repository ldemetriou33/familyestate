/**
 * Abbey OS - Sovereign Equity Calculations
 * Calculates "True" Net Worth vs Gross Value
 */

import type {
  Asset,
  Ownership,
  SovereignEquity,
  ConsolidationScenario,
} from '@/lib/types/estate'

/**
 * Calculate Dad's share of equity for a single asset
 */
export function calculateDadShareEquity(asset: Asset): number {
  const totalDebt = asset.debts.reduce((sum, debt) => {
    // Convert to same currency (simplified - assumes GBP for now)
    const debtValue = debt.currency === 'GBP' ? debt.current_balance : 0
    return sum + debtValue
  }, 0)

  const netEquity = asset.valuation - totalDebt
  return netEquity * asset.ownership.dad_share
}

/**
 * Calculate Uncles' share of equity for a single asset
 */
export function calculateUnclesShareEquity(asset: Asset): number {
  const totalDebt = asset.debts.reduce((sum, debt) => {
    const debtValue = debt.currency === 'GBP' ? debt.current_balance : 0
    return sum + debtValue
  }, 0)

  const netEquity = asset.valuation - totalDebt
  const unclesShare = asset.ownership.uncle_a_share + asset.ownership.uncle_b_share
  return netEquity * unclesShare
}

/**
 * Calculate total Sovereign Equity across all assets
 */
export function calculateSovereignEquity(assets: Asset[]): SovereignEquity {
  let totalAssetValue = 0
  let totalDebt = 0
  let dadShareEquity = 0
  let unclesShareEquity = 0

  for (const asset of assets) {
    // Convert valuations to GBP (simplified conversion)
    const assetValueGBP =
      asset.currency === 'GBP' ? asset.valuation : asset.valuation * 0.85 // Rough EUR to GBP

    totalAssetValue += assetValueGBP

    // Calculate debt in GBP
    const assetDebt = asset.debts.reduce((sum, debt) => {
      const debtValue =
        debt.currency === 'GBP'
          ? debt.current_balance
          : debt.current_balance * 0.85 // Rough EUR to GBP
      return sum + debtValue
    }, 0)

    totalDebt += assetDebt

    // Calculate equity shares
    const netEquity = assetValueGBP - assetDebt
    dadShareEquity += netEquity * asset.ownership.dad_share
    unclesShareEquity += netEquity * (asset.ownership.uncle_a_share + asset.ownership.uncle_b_share)
  }

  const grossEquity = totalAssetValue - totalDebt

  // Calculate consolidation cost (buying out uncles at 30% discount)
  const minorityDiscountFactor = 0.7
  const consolidationCost = unclesShareEquity * minorityDiscountFactor

  // Net Sovereign Equity after consolidation
  const netSovereignEquity = dadShareEquity + consolidationCost

  return {
    total_asset_value: totalAssetValue,
    total_debt: totalDebt,
    gross_equity: grossEquity,
    dad_share_equity: dadShareEquity,
    uncles_share_equity: unclesShareEquity,
    consolidation_cost: consolidationCost,
    net_sovereign_equity: netSovereignEquity,
  }
}

/**
 * Calculate consolidation scenario for a specific asset
 */
export function calculateConsolidationScenario(
  asset: Asset,
  minorityDiscountFactor: number = 0.7
): ConsolidationScenario {
  const totalDebt = asset.debts.reduce((sum, debt) => {
    const debtValue = debt.currency === 'GBP' ? debt.current_balance : debt.current_balance * 0.85
    return sum + debtValue
  }, 0)

  const netEquity = asset.valuation - totalDebt
  const unclesShare = asset.ownership.uncle_a_share + asset.ownership.uncle_b_share
  const unclesEquity = netEquity * unclesShare
  const buyoutCost = unclesEquity * minorityDiscountFactor

  return {
    asset_id: asset.id,
    current_ownership: asset.ownership,
    buyout_cost: buyoutCost,
    minority_discount_factor: minorityDiscountFactor,
    total_cost: buyoutCost,
    dad_equity_after: netEquity, // 100% ownership after buyout
  }
}

/**
 * Calculate consolidation cost for multiple assets
 */
export function calculateTotalConsolidationCost(
  assets: Asset[],
  minorityDiscountFactor: number = 0.7
): number {
  let totalCost = 0

  for (const asset of assets) {
    const scenario = calculateConsolidationScenario(asset, minorityDiscountFactor)
    totalCost += scenario.buyout_cost
  }

  return totalCost
}

