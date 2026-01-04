/**
 * Abbey OS - Inheritance Tax (IHT) Calculator
 * April 2026 Cap: £1M individual / £2M couple threshold
 */

import type { SovereignAsset } from '@/lib/data/sovereign-seed'

export interface IHTExposure {
  personalAssetsValue: number // Assets in PERSONAL entity
  threshold: number // £2M for couple
  excess: number // Amount over threshold
  effectiveRate: number // 20% on excess
  estimatedTax: number
  isExposed: boolean
}

/**
 * Calculate IHT exposure based on personal assets
 */
export function calculateIHTExposure(
  assets: SovereignAsset[]
): IHTExposure {
  // Filter assets in PERSONAL entity
  const personalAssets = assets.filter(
    (asset) => asset.ownership.entity === 'PERSONAL'
  )

  // Calculate total value in GBP
  let personalAssetsValue = 0
  for (const asset of personalAssets) {
    const valueInGBP =
      asset.currency === 'GBP' ? asset.valuation : asset.valuation * 0.85
    personalAssetsValue += valueInGBP
  }

  const threshold = 2_000_000 // £2M for couple
  const excess = Math.max(0, personalAssetsValue - threshold)
  const effectiveRate = 0.2 // 20% on excess
  const estimatedTax = excess * effectiveRate
  const isExposed = excess > 0

  return {
    personalAssetsValue,
    threshold,
    excess,
    effectiveRate,
    estimatedTax,
    isExposed,
  }
}

