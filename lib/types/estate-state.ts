/**
 * Global Estate State Types
 */

export type AssetStatus = 'Leased' | 'Renovation' | 'Strategic Hold' | 'For Sale' | 'OPERATIONAL'
export type AssetTier = 'Core' | 'Value-Add' | 'Opportunistic'
export type Currency = 'GBP' | 'EUR' | 'USD'

export interface EstateAsset {
  id: string
  name: string
  value: number
  debt: number
  owner_dad_pct: number // Percentage (0-100)
  owner_uncle_pct: number // Percentage (0-100)
  status: AssetStatus
  tier: AssetTier
  currency: Currency
  location: string
  entity?: string
  metadata?: Record<string, unknown>
}

export interface EstateState {
  assets: EstateAsset[]
  currency: Currency
}

export interface EstateContextType {
  assets: EstateAsset[]
  currency: Currency
  updateAsset: (id: string, updates: Partial<EstateAsset>) => void
  totals: {
    totalGrossValue: number
    totalDebt: number
    principalEquity: number
    minorityEquity: number
    ltv: number
  }
}

