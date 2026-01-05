/**
 * Global Estate State Types
 */

export type AssetStatus = 'Leased' | 'Renovation' | 'Strategic Hold' | 'For Sale' | 'OPERATIONAL'
export type AssetTier = 'Core' | 'Value-Add' | 'Opportunistic'
export type Currency = 'GBP' | 'EUR' | 'USD'

export type EntityType = 'MAD Ltd' | 'Dem Bro Ltd' | 'Personal (Dad)' | 'Grandma'

export interface EstateAsset {
  id: string
  name: string
  value: number
  debt: number
  owner_dad_pct: number // Percentage (0-100)
  owner_uncle_pct: number // Percentage (0-100)
  owner_uncle_a_pct?: number // Percentage (0-100) - Specific Uncle A split
  owner_uncle_b_pct?: number // Percentage (0-100) - Specific Uncle B split
  legal_title?: string // Legal title holder (e.g., "Grandma" for Oakwood Close)
  beneficial_interest_pct?: number // Beneficial interest percentage (for beneficial interest calculations)
  status: AssetStatus
  tier: AssetTier
  currency: Currency
  location: string
  entity?: EntityType
  bought_date?: string // e.g., "Aug 2001"
  bought_price?: number
  monthly_payment?: number // For calculating accurate cash flow
  turnover?: number // Annual revenue
  notes?: string // History context
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

