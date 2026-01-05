/**
 * Abbey OS - Sovereign Relational Seed Data
 * Verified January 2026 Estate Data
 */

import type { Entity, Asset, Liability, Document } from '@/lib/types/sovereign-schema'

// Entity IDs
const ENTITY_MAD_LTD = 'entity-mad-ltd'
const ENTITY_DEM_BRO_LTD = 'entity-dem-bro-ltd'
const ENTITY_PRINCIPAL = 'entity-principal'
const ENTITY_GRANDMA = 'entity-grandma'

// Asset IDs
const ASSET_HOTEL = 'asset-hotel'
const ASSET_CAR_PARK = 'asset-car-park'
const ASSET_LAVENDER_HILL = 'asset-lavender-hill'
const ASSET_CAFE_ROYAL = 'asset-cafe-royal'
const ASSET_MYMMS_DRIVE = 'asset-mymms-drive'
const ASSET_EAST_STREET = 'asset-east-street'
const ASSET_MILTON_AVE = 'asset-milton-ave'
const ASSET_OAKWOOD = 'asset-oakwood'

export const seedEntities: Entity[] = [
  {
    id: ENTITY_MAD_LTD,
    name: 'MAD Ltd',
    type: 'Corporate',
    shareholders: [
      { name: 'Dad', percentage: 33.3 },
      { name: 'Uncle A', percentage: 33.3 },
      { name: 'Uncle B', percentage: 33.3 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: ENTITY_DEM_BRO_LTD,
    name: 'Dem Bro Ltd',
    type: 'Corporate',
    shareholders: [
      { name: 'Dad', percentage: 33.3 },
      { name: 'Uncle A', percentage: 33.3 },
      { name: 'Uncle B', percentage: 33.3 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: ENTITY_PRINCIPAL,
    name: 'Principal (Personal)',
    type: 'Individual',
    shareholders: [
      { name: 'Dad', percentage: 100 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: ENTITY_GRANDMA,
    name: 'Grandma (Probate)',
    type: 'Individual',
    shareholders: [
      { name: 'Grandma', percentage: 100 }
    ],
    created_at: new Date().toISOString()
  }
]

export const seedAssets: Asset[] = [
  // MAD Ltd Assets
  {
    id: ASSET_HOTEL,
    entity_id: ENTITY_MAD_LTD,
    name: 'Abbey Point Hotel',
    valuation: 7_000_000,
    revenue_monthly: 1_500_000 / 12, // £1.5M annual / 12
    status: 'Operational',
    currency: 'GBP',
    location: 'Wembley, UK',
    bought_date: 'Aug 2001',
    bought_price: 365_000,
    notes: 'Spent £4M on Capex',
    created_at: new Date().toISOString()
  },
  {
    id: ASSET_CAR_PARK,
    entity_id: ENTITY_MAD_LTD,
    name: 'Wembley Car Park',
    valuation: 450_000,
    revenue_monthly: 20_000 / 12, // £20k annual / 12
    status: 'Operational',
    currency: 'GBP',
    location: 'Wembley, UK',
    created_at: new Date().toISOString()
  },
  
  // Dem Bro Ltd Assets
  {
    id: ASSET_LAVENDER_HILL,
    entity_id: ENTITY_DEM_BRO_LTD,
    name: '113 Lavender Hill',
    valuation: 2_000_000,
    revenue_monthly: 127_000 / 12, // £127k annual / 12
    status: 'Operational',
    currency: 'GBP',
    location: 'UK',
    created_at: new Date().toISOString()
  },
  {
    id: ASSET_CAFE_ROYAL,
    entity_id: ENTITY_DEM_BRO_LTD,
    name: 'Cafe Royal (The Flats)',
    valuation: 850_000,
    revenue_monthly: 72_000 / 12, // £72k annual / 12
    status: 'Operational',
    currency: 'GBP',
    location: 'UK',
    notes: 'Freehold/Cafe given to Brother. Dad owns 0% of downstairs cafe/freehold',
    created_at: new Date().toISOString()
  },
  
  // Principal Personal Assets
  {
    id: ASSET_MYMMS_DRIVE,
    entity_id: ENTITY_PRINCIPAL,
    name: 'Mymms Drive',
    valuation: 1_475_000, // Purchase Price -> Target Resale: £2,000,000
    revenue_monthly: 0, // Renovation - no revenue yet
    status: 'Renovation',
    currency: 'GBP',
    location: 'UK',
    bought_date: 'Oct 2024',
    notes: 'Stamp Duty £125k. Reno Budget £200k (£100k spent so far)',
    created_at: new Date().toISOString()
  },
  {
    id: ASSET_EAST_STREET,
    entity_id: ENTITY_PRINCIPAL,
    name: 'East Street',
    valuation: 1_000_000,
    revenue_monthly: 52_800 / 12, // £52.8k annual / 12
    status: 'For Sale',
    currency: 'GBP',
    location: 'UK',
    bought_date: 'March 1998',
    bought_price: 130_000,
    created_at: new Date().toISOString()
  },
  {
    id: ASSET_MILTON_AVE,
    entity_id: ENTITY_PRINCIPAL,
    name: '91 Milton Avenue',
    valuation: 675_000,
    revenue_monthly: 25_000 / 12, // £25k annual / 12
    status: 'For Sale',
    currency: 'GBP',
    location: 'UK',
    created_at: new Date().toISOString()
  },
  
  // Grandma Assets
  {
    id: ASSET_OAKWOOD,
    entity_id: ENTITY_GRANDMA,
    name: '6 Oakwood Close',
    valuation: 750_000,
    revenue_monthly: 0,
    status: 'Strategic Hold',
    currency: 'GBP',
    location: 'UK',
    notes: 'Wealth Decay (Accruing Interest). Sold on death to break even -> Priority for refinancing',
    created_at: new Date().toISOString()
  }
]

export const seedLiabilities: Liability[] = [
  // Hotel Debt
  {
    id: 'liability-hotel',
    asset_id: ASSET_HOTEL,
    lender: 'Handelsbanken',
    amount: 3_000_000,
    rate: 5.5,
    maturity_date: '2030-12-31', // Example date
    type: 'Interest Only',
    created_at: new Date().toISOString()
  },
  
  // Lavender Hill Debt
  {
    id: 'liability-lavender',
    asset_id: ASSET_LAVENDER_HILL,
    lender: 'Handelsbanken',
    amount: 1_500_000,
    rate: 5.5,
    maturity_date: '2030-12-31',
    type: 'Fixed',
    created_at: new Date().toISOString()
  },
  
  // Cafe Royal Debt
  {
    id: 'liability-cafe',
    asset_id: ASSET_CAFE_ROYAL,
    lender: 'Handelsbanken',
    amount: 600_000,
    rate: 5.5,
    maturity_date: '2030-12-31',
    type: 'Fixed',
    created_at: new Date().toISOString()
  },
  
  // Mymms Drive Debt
  {
    id: 'liability-mymms',
    asset_id: ASSET_MYMMS_DRIVE,
    lender: 'Bridge/Dev Loan',
    amount: 1_070_000,
    rate: 5.5,
    maturity_date: '2026-12-31', // Short-term bridge loan
    type: 'Interest Only',
    created_at: new Date().toISOString()
  },
  
  // East Street Debt
  {
    id: 'liability-east',
    asset_id: ASSET_EAST_STREET,
    lender: 'Family Loan',
    amount: 550_000,
    rate: 6.1,
    maturity_date: '2035-12-31',
    type: 'Variable',
    monthly_payment: 2_800,
    created_at: new Date().toISOString()
  },
  
  // Milton Ave Debt
  {
    id: 'liability-milton',
    asset_id: ASSET_MILTON_AVE,
    lender: 'Legacy Lender',
    amount: 400_000,
    rate: 3.3,
    maturity_date: '2035-12-31',
    type: 'Fixed',
    monthly_payment: 1_100,
    created_at: new Date().toISOString()
  },
  
  // Oakwood Debt (Equity Release - Compounding)
  {
    id: 'liability-oakwood',
    asset_id: ASSET_OAKWOOD,
    lender: 'Equity Release Provider',
    amount: 400_000,
    rate: 6.2,
    maturity_date: '2040-12-31',
    type: 'Equity Release',
    is_compounding: true,
    created_at: new Date().toISOString()
  }
]

export const seedDocuments: Document[] = [
  {
    id: 'doc-hotel-deed',
    related_id: ASSET_HOTEL,
    related_type: 'Asset',
    name: 'Hotel Deed.pdf',
    type: 'Deed',
    status: 'Verified',
    created_at: new Date().toISOString()
  },
  {
    id: 'doc-hotel-lease',
    related_id: ASSET_HOTEL,
    related_type: 'Asset',
    name: 'Hotel Lease Agreement.pdf',
    type: 'Contract',
    status: 'Verified',
    created_at: new Date().toISOString()
  },
  {
    id: 'doc-oakwood-charge',
    related_id: ASSET_OAKWOOD,
    related_type: 'Asset',
    name: 'Oakwood Legal Charge.pdf',
    type: 'Loan',
    status: 'Verified',
    created_at: new Date().toISOString()
  },
  {
    id: 'doc-mad-ltd-cert',
    related_id: ENTITY_MAD_LTD,
    related_type: 'Entity',
    name: 'MAD Ltd Certificate of Incorporation.pdf',
    type: 'Deed',
    status: 'Verified',
    created_at: new Date().toISOString()
  }
]

export const seedSovereignData = () => ({
  entities: seedEntities,
  assets: seedAssets,
  liabilities: seedLiabilities,
  documents: seedDocuments
})

