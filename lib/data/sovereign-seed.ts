/**
 * Abbey OS - Sovereign Asset Orchestration Seed Data
 * Single Family Office - Strategic Estate Data
 */

export interface SovereignAsset {
  id: string
  name: string
  tier: 'S' | 'A' | 'B' | 'C' | 'D' // S = Engine, A = Sovereign, B = Liquidity, C = Liability
  location: 'UK' | 'CYPRUS'
  currency: 'GBP' | 'EUR'
  valuation: number
  debt?: {
    principal: number
    interestRate: number
    type: 'FIXED' | 'VARIABLE' | 'EQUITY_RELEASE'
    isCompound: boolean
  }
  ownership: {
    dad: number // Percentage (0-100)
    uncles: number
    entity: 'MAD_LTD' | 'DEM_BRO_LTD' | 'PERSONAL' | 'DIFC_FOUNDATION'
  }
  status: 'OPERATIONAL' | 'LEASED' | 'STRATEGIC_HOLD' | 'RENOVATION' | 'PRUNE'
  metadata: {
    targetRent?: number // Annual rent target
    spaces?: number // For car park
    eventModePrice?: number // Per space during events
    heritageGrantEligible?: number // Potential grant amount
    zoningUplift?: string // Expected date
    targetExit?: number // Target sale price
    netLiquidity?: number // Net profit after sale
    sellByDate?: string // ISO date for pruning
    notes?: string
  }
}

export interface SovereignEstate {
  assets: SovereignAsset[]
  totalGrossValue: number
  totalDebt: number
  dadEquity: number
  unclesEquity: number
}

/**
 * Core "Engine" Assets (UK) - S-Tier
 */
const engineAssets: SovereignAsset[] = [
  {
    id: 'abbey-point-hotel',
    name: 'Abbey Point Hotel',
    tier: 'S',
    location: 'UK',
    currency: 'GBP',
    valuation: 7_000_000,
    debt: {
      principal: 3_000_000,
      interestRate: 5.5,
      type: 'FIXED',
      isCompound: false,
    },
    ownership: {
      dad: 33,
      uncles: 67,
      entity: 'MAD_LTD',
    },
    status: 'LEASED',
    metadata: {
      targetRent: 450_000, // Annual
      notes: 'Goal: Consolidation to 100%',
    },
  },
  {
    id: 'wembley-car-park',
    name: 'Wembley Car Park',
    tier: 'S',
    location: 'UK',
    currency: 'GBP',
    valuation: 450_000,
    ownership: {
      dad: 100,
      uncles: 0,
      entity: 'MAD_LTD',
    },
    status: 'OPERATIONAL',
    metadata: {
      spaces: 15,
      eventModePrice: 50, // Per space during events
      notes: 'Unencumbered. Event Mode logic: If Wembley Event = True, Price = £50/space',
    },
  },
]

/**
 * "Sovereign" Assets (Cyprus) - A-Tier
 */
const sovereignAssets: SovereignAsset[] = [
  {
    id: 'ora-house',
    name: 'Ora House (The HQ)',
    tier: 'A',
    location: 'CYPRUS',
    currency: 'EUR',
    valuation: 480_000,
    ownership: {
      dad: 33,
      uncles: 67,
      entity: 'DEM_BRO_LTD',
    },
    status: 'STRATEGIC_HOLD',
    metadata: {
      heritageGrantEligible: 95_000,
      notes: 'Goal: 100% Buyout. Heritage Grant Eligible (€95k potential)',
    },
  },
  {
    id: 'parekklisia-land',
    name: 'Parekklisia Land (The Alpha)',
    tier: 'A',
    location: 'CYPRUS',
    currency: 'EUR',
    valuation: 265_000,
    ownership: {
      dad: 33,
      uncles: 67,
      entity: 'DEM_BRO_LTD',
    },
    status: 'STRATEGIC_HOLD',
    metadata: {
      zoningUplift: '2027',
      notes: 'Goal: 100% Buyout. Strategic Hold - Zoning uplift expected 2027',
    },
  },
]

/**
 * "Liquidity" Assets (The Fuel) - B-Tier
 */
const liquidityAssets: SovereignAsset[] = [
  {
    id: 'mymms-drive',
    name: 'Mymms Drive',
    tier: 'B',
    location: 'UK',
    currency: 'GBP',
    valuation: 2_000_000, // Target exit value
    ownership: {
      dad: 100,
      uncles: 0,
      entity: 'PERSONAL',
    },
    status: 'RENOVATION',
    metadata: {
      targetExit: 2_000_000,
      netLiquidity: 850_000, // After clearing Oakwood debt
      notes: 'Renovation Phase. Target Exit: £2M. Net Liquidity Event: +£850k (after clearing Oakwood)',
    },
  },
]

/**
 * "Liability" Assets (The Leak) - C-Tier
 */
const liabilityAssets: SovereignAsset[] = [
  {
    id: 'oakwood-close',
    name: 'Oakwood Close',
    tier: 'C',
    location: 'UK',
    currency: 'GBP',
    valuation: 750_000, // Estimated value
    debt: {
      principal: 400_000,
      interestRate: 6.2,
      type: 'EQUITY_RELEASE',
      isCompound: true,
    },
    ownership: {
      dad: 100,
      uncles: 0,
      entity: 'PERSONAL',
    },
    status: 'OPERATIONAL',
    metadata: {
      notes: 'Wealth Decay Alert: £400k Equity Release @ 6.2% Compounding. Display red progress bar.',
    },
  },
  {
    id: 'milton-ave',
    name: '91 Milton Avenue',
    tier: 'C',
    location: 'UK',
    currency: 'GBP',
    valuation: 675_000,
    ownership: {
      dad: 100,
      uncles: 0,
      entity: 'PERSONAL',
    },
    status: 'PRUNE',
    metadata: {
      sellByDate: '2026-05-01',
      notes: 'PRUNE: Sell before May 2026 Renters Rights Act',
    },
  },
  {
    id: 'east-street',
    name: 'East Street',
    tier: 'C',
    location: 'UK',
    currency: 'GBP',
    valuation: 500_000, // Estimated
    ownership: {
      dad: 100,
      uncles: 0,
      entity: 'PERSONAL',
    },
    status: 'PRUNE',
    metadata: {
      sellByDate: '2026-05-01',
      notes: 'PRUNE: Sell before May 2026 Renters Rights Act',
    },
  },
]

/**
 * Calculate estate totals
 */
export function calculateEstateTotals(assets: SovereignAsset[]): SovereignEstate {
  let totalGrossValue = 0
  let totalDebt = 0
  let dadEquity = 0
  let unclesEquity = 0

  for (const asset of assets) {
    // Convert EUR to GBP (rough 0.85 rate)
    const valueInGBP =
      asset.currency === 'GBP' ? asset.valuation : asset.valuation * 0.85
    totalGrossValue += valueInGBP

    const debtAmount = asset.debt
      ? asset.currency === 'GBP'
        ? asset.debt.principal
        : asset.debt.principal * 0.85
      : 0
    totalDebt += debtAmount

    const netValue = valueInGBP - debtAmount
    dadEquity += (netValue * asset.ownership.dad) / 100
    unclesEquity += (netValue * asset.ownership.uncles) / 100
  }

  return {
    assets,
    totalGrossValue,
    totalDebt,
    dadEquity,
    unclesEquity,
  }
}

/**
 * Seed the sovereign estate
 */
export function seedSovereignEstate(): SovereignEstate {
  const allAssets = [
    ...engineAssets,
    ...sovereignAssets,
    ...liquidityAssets,
    ...liabilityAssets,
  ]

  return calculateEstateTotals(allAssets)
}

/**
 * Get assets by tier
 */
export function getAssetsByTier(
  estate: SovereignEstate,
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
): SovereignAsset[] {
  return estate.assets.filter((asset) => asset.tier === tier)
}

/**
 * Get assets by status
 */
export function getAssetsByStatus(
  estate: SovereignEstate,
  status: SovereignAsset['status']
): SovereignAsset[] {
  return estate.assets.filter((asset) => asset.status === status)
}

