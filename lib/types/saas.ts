/**
 * Multi-Tenant SaaS Types for Abbey OS
 */

export interface Family {
  id: string
  name: string
  currency: 'USD' | 'GBP' | 'EUR'
  created_at: string
  updated_at: string
  settings?: Record<string, unknown>
}

export interface FamilyUser {
  id: string
  family_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  created_at: string
}

export interface Entity {
  id: string
  family_id: string
  name: string
  type: 'LTD' | 'TRUST' | 'PERSONAL' | 'FOUNDATION'
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  family_id: string
  entity_id?: string | null
  name: string
  location: string
  currency: 'USD' | 'GBP' | 'EUR'
  valuation: number
  principal_ownership: number // Percentage (0-100)
  minority_ownership: number // Percentage (0-100)
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  category?: string | null
  asset_class?: string | null
  status: 'OPERATIONAL' | 'LEASED' | 'STRATEGIC_HOLD' | 'RENOVATION' | 'PRUNE'
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  family_id: string
  asset_id?: string | null
  entity_id?: string | null
  creditor_name: string
  principal: number
  interest_rate: number
  debt_type: 'FIXED' | 'VARIABLE' | 'EQUITY_RELEASE'
  is_compound: boolean
  currency: 'USD' | 'GBP' | 'EUR'
  maturity_date?: string | null
  created_at: string
  updated_at: string
}

export interface EstatePortfolio {
  family: Family
  entities: Entity[]
  assets: Asset[]
  debts: Debt[]
  totals: {
    totalGrossValue: number
    totalDebt: number
    principalEquity: number
    minorityEquity: number
  }
}

