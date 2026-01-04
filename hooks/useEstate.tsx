'use client'

import { useState, useMemo, useCallback } from 'react'
import type { EstateAsset, EstateState, EstateContextType } from '@/lib/types/estate-state'
import { INITIAL_ESTATE_DATA, DEFAULT_CURRENCY } from '@/lib/data/estate-seed-state'

/**
 * Custom hook for managing estate data
 */
export function useEstate(initialData?: EstateAsset[]): EstateContextType {
  const [assets, setAssets] = useState<EstateAsset[]>(initialData || INITIAL_ESTATE_DATA)
  const currency = DEFAULT_CURRENCY

  // Calculate totals
  const totals = useMemo(() => {
    // Currency conversion rates
    const convertToGBP = (value: number, fromCurrency: string): number => {
      if (fromCurrency === 'GBP') return value
      if (fromCurrency === 'EUR') return value * 0.85
      if (fromCurrency === 'USD') return value * 0.79
      return value
    }

    let totalGrossValue = 0
    let totalDebt = 0
    let principalEquity = 0
    let minorityEquity = 0

    for (const asset of assets) {
      const valueInGBP = convertToGBP(asset.value, asset.currency)
      const debtInGBP = convertToGBP(asset.debt, asset.currency)

      totalGrossValue += valueInGBP
      totalDebt += debtInGBP

      const netValue = valueInGBP - debtInGBP
      principalEquity += (netValue * asset.owner_dad_pct) / 100
      minorityEquity += (netValue * asset.owner_uncle_pct) / 100
    }

    const ltv = totalGrossValue > 0 ? (totalDebt / totalGrossValue) * 100 : 0

    return {
      totalGrossValue,
      totalDebt,
      principalEquity,
      minorityEquity,
      ltv,
    }
  }, [assets])

  // Update asset function
  const updateAsset = useCallback((id: string, updates: Partial<EstateAsset>) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => (asset.id === id ? { ...asset, ...updates } : asset))
    )
  }, [])

  return {
    assets,
    currency,
    updateAsset,
    totals,
  }
}

