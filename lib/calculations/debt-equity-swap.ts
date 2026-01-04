/**
 * Abbey OS - Debt-for-Equity Swap Calculator
 * Calculates how many shares/ownership % a loan can purchase
 */

import type { DebtEquitySwap, Asset, Ownership } from '@/lib/types/estate'

/**
 * Calculate debt-for-equity swap for a specific asset
 */
export function calculateDebtEquitySwap(
  loanAmount: number,
  currency: 'GBP' | 'EUR' | 'USD',
  targetAsset: Asset,
  currentDadOwnership: number
): DebtEquitySwap {
  // Convert loan to asset currency (simplified)
  const loanInAssetCurrency =
    currency === targetAsset.currency
      ? loanAmount
      : currency === 'GBP' && targetAsset.currency === 'EUR'
        ? loanAmount * 1.18 // GBP to EUR
        : loanAmount * 0.85 // EUR to GBP

  // Calculate total debt on asset
  const totalDebt = targetAsset.debts.reduce((sum, debt) => {
    const debtValue =
      debt.currency === targetAsset.currency
        ? debt.current_balance
        : debt.current_balance * 0.85
    return sum + debtValue
  }, 0)

  // Net equity of the asset
  const netEquity = targetAsset.valuation - totalDebt

  // Calculate what percentage of the asset the loan can buy
  // Assuming the loan is used to buy out uncles' shares
  const unclesShare = targetAsset.ownership.uncle_a_share + targetAsset.ownership.uncle_b_share
  const unclesEquity = netEquity * unclesShare

  // How much of uncles' equity can be bought with this loan
  const equityPurchased = Math.min(loanInAssetCurrency, unclesEquity)
  const ownershipPercentagePurchased = equityPurchased / netEquity

  // New ownership after swap
  const newDadOwnership = currentDadOwnership + ownershipPercentagePurchased

  // Generate terms summary
  const termsSummary = generateTermsSummary(
    loanAmount,
    currency,
    targetAsset,
    ownershipPercentagePurchased,
    newDadOwnership
  )

  return {
    loan_amount: loanAmount,
    currency,
    target_entity: targetAsset.ownership.entity,
    target_asset_id: targetAsset.id,
    current_valuation: targetAsset.valuation,
    shares_purchased: ownershipPercentagePurchased,
    ownership_percentage_after: newDadOwnership,
    terms_summary: termsSummary,
  }
}

/**
 * Generate a human-readable terms summary
 */
function generateTermsSummary(
  loanAmount: number,
  currency: 'GBP' | 'EUR' | 'USD',
  asset: Asset,
  ownershipPurchased: number,
  newOwnership: number
): string {
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'
  const ownershipPercent = (ownershipPurchased * 100).toFixed(1)
  const newOwnershipPercent = (newOwnership * 100).toFixed(1)

  return `Loan of ${currencySymbol}${loanAmount.toLocaleString()} converts to ${ownershipPercent}% ownership in ${asset.name}. 
    After conversion, total ownership will be ${newOwnershipPercent}%. 
    Asset valuation: ${asset.currency === 'GBP' ? '£' : '€'}${asset.valuation.toLocaleString()}.`
}

/**
 * Calculate debt-for-equity swap for an entity (MAD Ltd, Dem Bro Ltd, etc.)
 */
export function calculateEntityDebtEquitySwap(
  loanAmount: number,
  currency: 'GBP' | 'EUR' | 'USD',
  entityAssets: Asset[],
  targetEntity: 'MAD_LTD' | 'DEM_BRO_LTD' | 'CYPRUS_COMPANY'
): DebtEquitySwap[] {
  const entityAssetsList = entityAssets.filter(
    (asset) => asset.ownership.entity === targetEntity
  )

  const swaps: DebtEquitySwap[] = []

  // Distribute loan across assets proportionally by valuation
  const totalValuation = entityAssetsList.reduce(
    (sum, asset) => sum + asset.valuation,
    0
  )

  for (const asset of entityAssetsList) {
    const proportion = asset.valuation / totalValuation
    const allocatedLoan = loanAmount * proportion

    const swap = calculateDebtEquitySwap(
      allocatedLoan,
      currency,
      asset,
      asset.ownership.dad_share
    )

    swaps.push(swap)
  }

  return swaps
}

