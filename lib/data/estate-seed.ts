/**
 * Abbey OS - Estate Seed Data
 * Hardcoded initial state for the family estate
 */

import type {
  Asset,
  Ownership,
  Debt,
  Revenue,
  EventModeConfig,
  EstatePortfolio,
} from '@/lib/types/estate'

// Helper to create ownership structure
function createOwnership(
  entity: 'MAD_LTD' | 'DEM_BRO_LTD' | 'PERSONAL' | 'CYPRUS_COMPANY' | 'DIFC_FOUNDATION',
  dadShare: number,
  uncleAShare: number = 0,
  uncleBShare: number = 0,
  model: 'SHARED' | 'CONSOLIDATED' | 'VAULTED' = 'SHARED',
  vaultedToDIFC: boolean = false,
  consolidationTarget: boolean = false
): Ownership {
  return {
    entity,
    dad_share: dadShare,
    uncle_a_share: uncleAShare,
    uncle_b_share: uncleBShare,
    total_share: dadShare + uncleAShare + uncleBShare,
    model,
    vaulted_to_difc: vaultedToDIFC,
    consolidation_target: consolidationTarget,
  }
}

// Helper to create debt
function createDebt(
  assetId: string,
  principal: number,
  currentBalance: number,
  interestRate: number,
  type: 'MORTGAGE' | 'EQUITY_RELEASE' | 'LOAN' | 'INTEREST_ONLY',
  currency: 'GBP' | 'EUR' | 'USD',
  isCompound: boolean = false,
  monthlyPayment?: number,
  notes?: string
): Debt {
  return {
    id: `${assetId}-debt-${Date.now()}`,
    asset_id: assetId,
    principal,
    current_balance: currentBalance,
    interest_rate: interestRate,
    type,
    currency,
    is_compound: isCompound,
    start_date: new Date().toISOString(),
    monthly_payment: monthlyPayment,
    notes,
  }
}

// Helper to create revenue
function createRevenue(
  assetId: string,
  annualRevenue: number,
  currency: 'GBP' | 'EUR' | 'USD',
  revenueType: 'HOTEL' | 'RENTAL' | 'CAR_PARK' | 'CAFE' | 'OTHER',
  projected: boolean = false
): Revenue {
  return {
    asset_id: assetId,
    annual_revenue: annualRevenue,
    monthly_revenue: annualRevenue / 12,
    currency,
    revenue_type: revenueType,
    projected,
  }
}

/**
 * Seed Estate Data
 */
export function seedEstateData(): EstatePortfolio {
  const assets: Asset[] = []

  // 1. Abbey Point Hotel (Core Asset)
  const abbeyPointId = 'abbey-point-hotel'
  assets.push({
    id: abbeyPointId,
    name: 'Abbey Point Hotel',
    location: '300-302 Twyford Abbey Road, Park Royal (Near Wembley)',
    country: 'UK',
    valuation: 7_000_000,
    currency: 'GBP',
    status: 'OPERATIONAL',
    ownership: createOwnership('MAD_LTD', 0.333, 0.333, 0.334, 'SHARED', false, true),
    debts: [
      createDebt(
        abbeyPointId,
        3_000_000,
        3_000_000,
        5.5,
        'INTEREST_ONLY',
        'GBP',
        false,
        undefined,
        'Interest Only, Fixed 5.5%'
      ),
    ],
    revenues: [
      createRevenue(abbeyPointId, 1_500_000, 'GBP', 'HOTEL', true),
    ],
    metadata: {
      notes: 'Operational hotel near Wembley. Core asset for consolidation.',
      is_core_asset: true,
      lease_payment: 450_000, // Annual Triple Net lease
    },
  })

  // 2. Hotel Car Park Strip (Core Asset)
  const carParkId = 'hotel-car-park'
  assets.push({
    id: carParkId,
    name: 'Hotel Car Park Strip',
    location: '300-302 Twyford Abbey Road, Park Royal',
    country: 'UK',
    valuation: 450_000,
    currency: 'GBP',
    status: 'OPERATIONAL',
    ownership: createOwnership('MAD_LTD', 0.333, 0.333, 0.334, 'SHARED', false, true),
    debts: [],
    revenues: [],
    metadata: {
      spaces: 15,
      notes: 'Unencumbered. Strategic utility for Wembley Event Mode',
      strategic_goal: 'High yield potential during events',
      is_core_asset: true,
    },
  })

  // 3. Mymms Drive
  const mymmsId = 'mymms-drive'
  assets.push({
    id: mymmsId,
    name: 'Mymms Drive',
    location: 'Mymms Drive, UK',
    country: 'UK',
    valuation: 2_000_000,
    currency: 'GBP',
    status: 'UNDER_RENOVATION',
    ownership: createOwnership('MAD_LTD', 0.333, 0.333, 0.334),
    debts: [
      createDebt(mymmsId, 1_070_000, 1_070_000, 0, 'MORTGAGE', 'GBP'),
    ],
    revenues: [],
    metadata: {
      notes: 'Under Renovation. Exit Strategy: Sell to clear Oakwood debt',
    },
  })

  // 4. 113 Lavender Hill
  const lavenderHillId = 'lavender-hill-113'
  assets.push({
    id: lavenderHillId,
    name: '113 Lavender Hill',
    location: '113 Lavender Hill, UK',
    country: 'UK',
    valuation: 2_000_000,
    currency: 'GBP',
    status: 'OPERATIONAL',
    ownership: createOwnership('DEM_BRO_LTD', 0.333, 0.333, 0.334),
    debts: [
      createDebt(lavenderHillId, 1_500_000, 1_500_000, 0, 'MORTGAGE', 'GBP'),
    ],
    revenues: [
      createRevenue(lavenderHillId, 127_000, 'GBP', 'RENTAL'),
    ],
    metadata: {
      notes: '1/3 ownership split',
    },
  })

  // 5. Cafe Royal (Flats + Cafe)
  const cafeRoyalId = 'cafe-royal'
  assets.push({
    id: cafeRoyalId,
    name: 'Cafe Royal (Flats + Cafe)',
    location: 'Cafe Royal, UK',
    country: 'UK',
    valuation: 850_000,
    currency: 'GBP',
    status: 'OPERATIONAL',
    ownership: createOwnership('DEM_BRO_LTD', 0.333, 0.333, 0.334),
    debts: [
      createDebt(cafeRoyalId, 600_000, 600_000, 0, 'MORTGAGE', 'GBP'),
    ],
    revenues: [
      createRevenue(cafeRoyalId, 72_000, 'GBP', 'RENTAL'),
      createRevenue(cafeRoyalId, 40_000, 'GBP', 'CAFE', true), // Projected cafe lease
    ],
    metadata: {
      notes: 'Leasehold. Cafe to be leased out (£40k/yr target)',
    },
  })

  // 6. Oakwood Close (Grandma's House) - PAYOFF Status
  const oakwoodId = 'oakwood-close'
  assets.push({
    id: oakwoodId,
    name: "Oakwood Close (Grandma's House)",
    location: 'Oakwood Close, UK',
    country: 'UK',
    valuation: 750_000,
    currency: 'GBP',
    status: 'PAYOFF',
    ownership: createOwnership('PERSONAL', 1.0, 0, 0, 'SHARED'),
    debts: [
      createDebt(
        oakwoodId,
        400_000,
        400_000,
        6.2,
        'EQUITY_RELEASE',
        'GBP',
        true, // Compound interest
        undefined,
        'Equity Release @ ~6.2% accruing. Wealth Leak alert needed. Mymms sale will clear this.'
      ),
    ],
    revenues: [],
    metadata: {
      notes: 'Wealth Leak alert needed (Compound interest tracker). Mymms sale will clear debt.',
    },
  })

  // 7. 91 Milton Avenue (Pruning Asset - SELL)
  const miltonAveId = 'milton-avenue-91'
  const sellByDate = new Date('2026-05-01').toISOString() // May 2026 UK Renters' Rights
  assets.push({
    id: miltonAveId,
    name: '91 Milton Avenue',
    location: '91 Milton Avenue, UK',
    country: 'UK',
    valuation: 675_000,
    currency: 'GBP',
    status: 'SELL',
    ownership: createOwnership('PERSONAL', 1.0, 0, 0, 'SHARED'),
    debts: [
      createDebt(miltonAveId, 400_000, 400_000, 0, 'MORTGAGE', 'GBP'),
    ],
    revenues: [
      createRevenue(miltonAveId, 25_000, 'GBP', 'RENTAL'),
    ],
    metadata: {
      notes: 'Renting (£25k/yr). Pruning asset - UK Renters\' Rights enforcement May 2026',
      sell_by_date: sellByDate,
    },
  })

  // 8. Ora House (Reg 0/12808) - Core Asset
  const oraHouseId = 'ora-house'
  assets.push({
    id: oraHouseId,
    name: 'Ora House (Reg 0/12808)',
    location: 'Ora Village, Cyprus',
    country: 'CYPRUS',
    valuation: 480_000,
    currency: 'EUR',
    status: 'STRATEGIC_HOLD',
    ownership: createOwnership('CYPRUS_COMPANY', 0.333, 0.333, 0.334, 'SHARED', false, true),
    debts: [],
    revenues: [],
    metadata: {
      registration_number: '0/12808',
      notes: 'Potential H1 Zone uplift. Strategic Goal: Buyout target using User Loan',
      strategic_goal: 'Buyout target using User Loan',
      is_core_asset: true,
    },
  })

  // 9. Parekklisia Land (Reg 0/13758) - Core Asset
  const parekklisiaId = 'parekklisia-land'
  assets.push({
    id: parekklisiaId,
    name: 'Parekklisia Land (Reg 0/13758)',
    location: 'Parekklisia, Cyprus',
    country: 'CYPRUS',
    valuation: 265_000,
    currency: 'EUR',
    status: 'STRATEGIC_HOLD',
    ownership: createOwnership('CYPRUS_COMPANY', 0.333, 0.333, 0.334, 'SHARED', false, true),
    debts: [
      createDebt(parekklisiaId, 100_000, 100_000, 0, 'LOAN', 'EUR'),
    ],
    revenues: [],
    metadata: {
      registration_number: '0/13758',
      notes: 'Strategic Hold. Consolidation target',
      is_core_asset: true,
    },
  })

  // Event Mode Configuration for Wembley Car Park
  const eventModes: EventModeConfig[] = [
    {
      asset_id: carParkId,
      event_daily_rate: 50, // £50
      normal_daily_rate: 10, // £10
      event_dates: [], // Will be populated from API
      spaces: 15,
      projected_monthly_yield: 0, // Will be calculated
    },
  ]

  return {
    assets,
    event_modes: eventModes,
    cash_flow: {
      monthly_income: 0,
      monthly_debt_payments: 0,
      monthly_free_cash_flow: 0,
      cash_buffer: 0,
      is_positive: false,
      warning_threshold: 50_000,
      has_warning: false,
      breakdown: {},
    },
    sovereign_equity: {
      total_asset_value: 0,
      total_debt: 0,
      gross_equity: 0,
      dad_share_equity: 0,
      uncles_share_equity: 0,
      consolidation_cost: 0,
      net_sovereign_equity: 0,
    },
  }
}

