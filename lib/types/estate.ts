/**
 * Abbey OS - Estate Type Definitions
 * Sovereign Family Office Operating System
 */

export type EntityType = 'MAD_LTD' | 'DEM_BRO_LTD' | 'PERSONAL' | 'CYPRUS_COMPANY' | 'DIFC_FOUNDATION'

export type AssetStatus = 'OPERATIONAL' | 'UNDER_RENOVATION' | 'STRATEGIC_HOLD' | 'FOR_SALE' | 'RENTING' | 'SELL' | 'PAYOFF'

export type OwnershipModel = 'SHARED' | 'CONSOLIDATED' | 'VAULTED'

export type DebtType = 'MORTGAGE' | 'EQUITY_RELEASE' | 'LOAN' | 'INTEREST_ONLY'

export type Currency = 'GBP' | 'EUR' | 'USD'

/**
 * Ownership structure - tracks fractional shares
 */
export interface Ownership {
  entity: EntityType
  dad_share: number // 0.0 to 1.0 (e.g., 0.333 for 1/3)
  uncle_a_share: number
  uncle_b_share: number
  total_share: number // Should equal 1.0
  model: OwnershipModel // SHARED, CONSOLIDATED, or VAULTED
  vaulted_to_difc?: boolean // Succession status
  consolidation_target?: boolean // Is this a target for buyout?
}

/**
 * Debt structure
 */
export interface Debt {
  id: string
  asset_id: string
  principal: number
  current_balance: number
  interest_rate: number // Annual percentage (e.g., 5.5 for 5.5%)
  type: DebtType
  currency: Currency
  is_compound: boolean // For equity release tracking
  start_date: string // ISO date
  maturity_date?: string // ISO date
  monthly_payment?: number
  notes?: string
}

/**
 * Revenue structure
 */
export interface Revenue {
  asset_id: string
  annual_revenue: number
  monthly_revenue: number
  currency: Currency
  revenue_type: 'HOTEL' | 'RENTAL' | 'CAR_PARK' | 'CAFE' | 'OTHER'
  projected?: boolean
}

/**
 * Asset structure
 */
export interface Asset {
  id: string
  name: string
  location: string
  country: 'UK' | 'CYPRUS'
  valuation: number
  currency: Currency
  status: AssetStatus
  ownership: Ownership
  debts: Debt[]
  revenues: Revenue[]
  metadata?: {
    registration_number?: string
    spaces?: number // For car parks
    units?: number // For residential
    notes?: string
    strategic_goal?: string
    lease_payment?: number // Annual lease (e.g., £450k Triple Net)
    sell_by_date?: string // ISO date for pruning (e.g., May 2026)
    is_core_asset?: boolean // Core 4: Hotel, Car Park, Ora, Parekklisia
  }
}

/**
 * Event Mode configuration for Wembley Car Park
 */
export interface EventModeConfig {
  asset_id: string
  event_daily_rate: number // e.g., £50
  normal_daily_rate: number // e.g., £10
  event_dates: string[] // ISO dates
  spaces?: number // Number of parking spaces
  projected_monthly_yield?: number
}

/**
 * Consolidation calculation
 */
export interface ConsolidationScenario {
  asset_id: string
  current_ownership: Ownership
  buyout_cost: number
  minority_discount_factor: number // e.g., 0.7 (30% discount)
  total_cost: number
  dad_equity_after: number
}

/**
 * Debt-for-Equity swap calculation
 */
export interface DebtEquitySwap {
  loan_amount: number
  currency: Currency
  target_entity: EntityType
  target_asset_id?: string
  current_valuation: number
  shares_purchased: number
  ownership_percentage_after: number
  terms_summary: string
}

/**
 * Cash Flow Summary
 */
export interface CashFlowSummary {
  monthly_income: number
  monthly_debt_payments: number
  monthly_free_cash_flow: number
  cash_buffer: number
  is_positive: boolean
  warning_threshold: number // e.g., £50,000
  has_warning: boolean
  breakdown: {
    hotel_noi?: number
    rental_income?: number
    portfolio_yield?: number
    other_income?: number
  }
}

/**
 * Sovereign Equity Calculation
 */
export interface SovereignEquity {
  total_asset_value: number
  total_debt: number
  gross_equity: number
  dad_share_equity: number
  uncles_share_equity: number
  consolidation_cost: number // Cost to buy out uncles
  net_sovereign_equity: number // Dad's equity after consolidation
}

/**
 * Oakwood Decay Tracker
 */
export interface OakwoodDecay {
  asset_id: string
  current_equity: number
  debt_balance: number
  interest_rate: number
  daily_interest_accrual: number
  years_until_zero: number
  monthly_decay: number
  alert_level: 'SAFE' | 'WARNING' | 'CRITICAL'
}

/**
 * Debt-to-Equity Shadow Tracking
 */
export interface ShadowEquity {
  loan_amount: number
  currency: Currency
  interest_rate: number // e.g., 5%
  capitalization_frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
  current_shadow_equity: number // Accumulated interest
  target_entity: EntityType
  monthly_interest_accrual: number
}

/**
 * Consolidation Roadmap Step
 */
export interface ConsolidationStep {
  step_number: number
  asset_id: string
  asset_name: string
  current_ownership: number // Dad's current %
  target_ownership: number // 100% after buyout
  buyout_cost: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  estimated_completion?: string // ISO date
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

/**
 * Consolidation Roadmap
 */
export interface ConsolidationRoadmap {
  core_assets: Asset[]
  total_buyout_cost: number
  steps: ConsolidationStep[]
  estimated_timeline_months: number
  current_progress: number // Percentage complete
}

/**
 * Pruning Asset (For Sale)
 */
export interface PruningAsset {
  asset_id: string
  asset_name: string
  current_value: number
  sell_by_date: string // ISO date
  days_remaining: number
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  reason: string // e.g., "UK Renters' Rights enforcement May 2026"
}

/**
 * Estate Portfolio
 */
export interface EstatePortfolio {
  assets: Asset[]
  event_modes: EventModeConfig[]
  cash_flow: CashFlowSummary
  sovereign_equity: SovereignEquity
  oakwood_decay?: OakwoodDecay
  shadow_equity?: ShadowEquity
  consolidation_roadmap?: ConsolidationRoadmap
  pruning_assets?: PruningAsset[]
}

