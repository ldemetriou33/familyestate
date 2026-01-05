/**
 * Abbey OS - Sovereign Relational Schema
 * Entity-First Architecture: Entities -> Assets -> Liabilities -> Documents
 */

export interface Entity {
  id: string
  name: string
  type: 'Corporate' | 'Individual' | 'Trust/Foundation'
  shareholders: Array<{ name: string; percentage: number }>
  created_at?: string
  updated_at?: string
  updated_by?: string
}

export interface Asset {
  id: string
  entity_id: string
  name: string
  valuation: number
  revenue_monthly: number
  status: 'Operational' | 'Renovation' | 'Strategic Hold' | 'For Sale'
  currency: 'GBP' | 'EUR' | 'USD'
  location: string
  bought_date?: string
  bought_price?: number
  notes?: string
  created_at?: string
  updated_at?: string
  updated_by?: string
}

export interface Liability {
  id: string
  asset_id: string
  lender: string
  amount: number
  rate: number
  maturity_date: string // ISO date
  type: 'Fixed' | 'Variable' | 'Interest Only' | 'Equity Release'
  monthly_payment?: number
  is_compounding?: boolean
  created_at?: string
  updated_at?: string
  updated_by?: string
}

export interface Document {
  id: string
  related_id: string // Asset or Entity ID
  related_type: 'Asset' | 'Entity'
  name: string
  type: 'Deed' | 'Loan' | 'Contract' | 'Insurance'
  status: 'Verified' | 'Missing' | 'Expiring Soon'
  file_url?: string
  created_at?: string
  updated_at?: string
  updated_by?: string
}

