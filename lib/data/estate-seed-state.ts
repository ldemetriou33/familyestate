/**
 * Initial Estate Data for SPA - Actual Historical Data from Principal
 */

import type { EstateAsset, Currency } from '@/lib/types/estate-state'

export const INITIAL_ESTATE_DATA: EstateAsset[] = [
  // A. MAD Ltd Assets (33% Dad, 33% Uncle A, 33% Uncle B)
  {
    id: 'abbey-point-hotel',
    name: 'Abbey Point Hotel',
    value: 7_000_000,
    debt: 3_000_000,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    owner_uncle_a_pct: 33.3,
    owner_uncle_b_pct: 33.3,
    status: 'Leased',
    tier: 'Core',
    currency: 'GBP',
    location: 'Wembley, UK',
    entity: 'MAD Ltd',
    bought_date: 'Aug 2001',
    bought_price: 365_000,
    turnover: 1_500_000, // Rooms £1.1M + Cafe rest
    interest_rate: 5.5, // Fixed Interest Only
    notes: 'Spent £4M on Capex',
  },
  {
    id: 'mymms-drive',
    name: 'Mymms Drive',
    value: 1_475_000, // Purchase Price -> Target Resale: £2,000,000
    debt: 1_070_000, // Bridge/Dev Loan
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    status: 'Renovation',
    tier: 'Value-Add',
    currency: 'GBP',
    location: 'UK',
    entity: 'Personal (Dad)',
    bought_date: 'Oct 2024',
    interest_rate: 5.5, // Bridge/Dev Rate
    notes: 'Stamp Duty £125k. Reno Budget £200k (£100k spent so far)',
  },

  // B. Dem Bro Ltd Assets (33% Dad, 33% Uncle A, 33% Uncle B)
  {
    id: 'lavender-hill',
    name: '113 Lavender Hill',
    value: 2_000_000,
    debt: 1_500_000,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    status: 'OPERATIONAL',
    tier: 'Core',
    currency: 'GBP',
    location: 'UK',
    entity: 'Dem Bro Ltd',
    turnover: 127_000, // £115k Flats + £12k Shop
    interest_rate: 5.5, // Fixed
  },
  {
    id: 'cafe-royal',
    name: 'Cafe Royal (The Flats)',
    value: 850_000, // Leasehold/Business Value - Flats only
    debt: 600_000,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    status: 'OPERATIONAL',
    tier: 'Core',
    currency: 'GBP',
    location: 'UK',
    entity: 'Dem Bro Ltd',
    turnover: 72_000, // £6k/mo from 6 studio flats
    interest_rate: 5.5, // Fixed
    notes: 'Freehold/Cafe given to Brother. Dad owns 0% of downstairs cafe/freehold',
  },

  // C. Personal Assets (Dad - 100%)
  {
    id: 'east-street',
    name: 'East Street',
    value: 1_000_000, // Updated from £500k
    debt: 550_000,
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    status: 'For Sale',
    tier: 'Opportunistic',
    currency: 'GBP',
    location: 'UK',
    entity: 'Personal (Dad)',
    bought_date: 'March 1998',
    bought_price: 130_000,
    monthly_payment: 2_800,
    interest_rate: 6.1, // Higher Variable/Fixed
    turnover: 52_800, // £3,400/mo Flats + £12k/yr Shop
  },
  {
    id: 'milton-ave',
    name: '91 Milton Avenue',
    value: 675_000,
    debt: 400_000,
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    status: 'For Sale',
    tier: 'Opportunistic',
    currency: 'GBP',
    location: 'UK',
    entity: 'Personal (Dad)',
    monthly_payment: 1_100,
    interest_rate: 3.3, // Cheap Legacy Rate
    turnover: 25_000,
  },

  // D. Legacy/Family Assets
  {
    id: 'oakwood-close',
    name: '6 Oakwood Close (Grandma)',
    value: 750_000,
    debt: 400_000, // Equity Release
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    legal_title: 'Grandma',
    beneficial_interest_pct: 100,
    status: 'OPERATIONAL',
    tier: 'Opportunistic',
    currency: 'GBP',
    location: 'UK',
    entity: 'Grandma',
    interest_rate: 6.2, // Compounding - No monthly payment; accrues to debt
    notes: 'Wealth Decay (Accruing Interest). Sold on death to break even -> Priority for refinancing',
    metadata: { note: 'Subject to Loan' },
  },

  // E. Additional Assets
  {
    id: 'wembley-car-park',
    name: 'Wembley Car Park',
    value: 450_000,
    debt: 0,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    owner_uncle_a_pct: 33.3,
    owner_uncle_b_pct: 33.3,
    status: 'OPERATIONAL',
    tier: 'Core',
    currency: 'GBP',
    location: 'Wembley, UK',
    entity: 'MAD Ltd',
  },
]

export const DEFAULT_CURRENCY: Currency = 'GBP'
