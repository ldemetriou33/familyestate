/**
 * Initial Estate Data for SPA
 */

import type { EstateAsset, Currency } from '@/lib/types/estate-state'

// Currency conversion rates (simplified)
const convertToGBP = (value: number, currency: Currency): number => {
  if (currency === 'GBP') return value
  if (currency === 'EUR') return value * 0.85
  if (currency === 'USD') return value * 0.79
  return value
}

export const INITIAL_ESTATE_DATA: EstateAsset[] = [
  // Core Engine Assets
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
  },
  {
    id: 'lavender-hill',
    name: 'Lavender Hill',
    value: 2_000_000,
    debt: 1_500_000,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    status: 'OPERATIONAL',
    tier: 'Core',
    currency: 'GBP',
    location: 'UK',
    entity: 'MAD Ltd',
  },
  {
    id: 'cafe-royal',
    name: 'Cafe Royal',
    value: 850_000,
    debt: 600_000,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    status: 'OPERATIONAL',
    tier: 'Core',
    currency: 'GBP',
    location: 'UK',
    entity: 'MAD Ltd',
  },
  {
    id: 'wembley-car-park',
    name: 'Wembley Car Park',
    value: 450_000,
    debt: 0,
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    status: 'OPERATIONAL',
    tier: 'Core',
    currency: 'GBP',
    location: 'Wembley, UK',
    entity: 'MAD Ltd',
  },
  // Sovereign Assets (Cyprus)
  {
    id: 'ora-house',
    name: 'Ora House (Cyprus HQ)',
    value: 480_000,
    debt: 0,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    status: 'Strategic Hold',
    tier: 'Core',
    currency: 'EUR',
    location: 'Cyprus',
    entity: 'Dem Bro Ltd',
  },
  {
    id: 'parekklisia-land',
    name: 'Parekklisia Land',
    value: 265_000,
    debt: 0,
    owner_dad_pct: 33.3,
    owner_uncle_pct: 66.7,
    status: 'Strategic Hold',
    tier: 'Value-Add',
    currency: 'EUR',
    location: 'Cyprus',
    entity: 'Dem Bro Ltd',
  },
  // Liquidity Assets
  {
    id: 'mymms-drive',
    name: 'Mymms Drive',
    value: 2_000_000,
    debt: 1_070_000,
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    status: 'Renovation',
    tier: 'Value-Add',
    currency: 'GBP',
    location: 'UK',
    entity: 'Personal',
  },
  // Liability Assets
  {
    id: 'oakwood-close',
    name: 'Oakwood Close',
    value: 750_000,
    debt: 400_000,
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    legal_title: 'Grandma',
    beneficial_interest_pct: 100,
    status: 'OPERATIONAL',
    tier: 'Opportunistic',
    currency: 'GBP',
    location: 'UK',
    entity: 'Personal',
    metadata: { note: 'Subject to Loan' },
  },
  {
    id: 'milton-ave',
    name: '91 Milton Avenue',
    value: 675_000,
    debt: 400_000, // FIXED
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    status: 'For Sale',
    tier: 'Opportunistic',
    currency: 'GBP',
    location: 'UK',
    entity: 'Personal',
  },
  {
    id: 'east-street',
    name: 'East Street',
    value: 500_000,
    debt: 300_000, // FIXED - Estimated
    owner_dad_pct: 100,
    owner_uncle_pct: 0,
    status: 'For Sale',
    tier: 'Opportunistic',
    currency: 'GBP',
    location: 'UK',
    entity: 'Personal',
  },
]

export const DEFAULT_CURRENCY: Currency = 'GBP'

