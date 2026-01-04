/**
 * Abbey OS - Consolidation Simulator
 * Calculates buyout power and interest savings
 */

import type { SovereignAsset } from '@/lib/data/sovereign-seed'

export interface ConsolidationScenario {
  cashInjection: number
  buyoutPower: {
    oraHouse: {
      canBuy: boolean
      percentage: number // Percentage of uncles' share we can buy
      cost: number
      remaining: number // Remaining uncles' share after buyout
    }
    parekklisia: {
      canBuy: boolean
      percentage: number
      cost: number
      remaining: number
    }
    hotel: {
      canBuy: boolean
      percentage: number
      cost: number
      remaining: number
    }
    lavenderHill: {
      canBuy: boolean
      percentage: number
      cost: number
      remaining: number
    }
    cafeRoyal: {
      canBuy: boolean
      percentage: number
      cost: number
      remaining: number
    }
  }
  interestSaved: {
    oakwoodDebt: number
    annualSavings: number
    monthlySavings: number
  }
  totalConsolidationCost: number
  remainingCash: number
}

/**
 * Calculate buyout cost for an asset
 * Applies 25% "Family Discount" for internal share transfers
 */
function calculateBuyoutCost(
  asset: SovereignAsset,
  familyDiscount: number = 0.75 // 25% discount for family transfers
): number {
  if (asset.ownership.uncles === 0) return 0

  const netValue =
    asset.currency === 'GBP'
      ? asset.valuation - (asset.debt?.principal || 0)
      : (asset.valuation - (asset.debt?.principal || 0)) * 0.85

  const unclesEquity = (netValue * asset.ownership.uncles) / 100
  return unclesEquity * familyDiscount
}

/**
 * Calculate how much of uncles' share can be bought with available cash
 * Uses 25% Family Discount
 */
function calculateBuyoutPower(
  asset: SovereignAsset,
  availableCash: number,
  familyDiscount: number = 0.75
): {
  canBuy: boolean
  percentage: number
  cost: number
  remaining: number
} {
  const totalBuyoutCost = calculateBuyoutCost(asset, familyDiscount)

  if (totalBuyoutCost === 0) {
    return {
      canBuy: true,
      percentage: 0,
      cost: 0,
      remaining: 0,
    }
  }

  const canBuy = availableCash >= totalBuyoutCost
  const percentage = canBuy
    ? 100
    : (availableCash / totalBuyoutCost) * 100

  const cost = Math.min(availableCash, totalBuyoutCost)
  const remaining = canBuy ? 0 : asset.ownership.uncles - (percentage / 100) * asset.ownership.uncles

  return {
    canBuy,
    percentage,
    cost,
    remaining,
  }
}

/**
 * Calculate Oakwood interest savings if debt is cleared
 */
function calculateInterestSavings(
  oakwoodAsset: SovereignAsset,
  monthsToClear: number = 12
): {
  oakwoodDebt: number
  annualSavings: number
  monthlySavings: number
} {
  if (!oakwoodAsset.debt || oakwoodAsset.debt.type !== 'EQUITY_RELEASE') {
    return {
      oakwoodDebt: 0,
      annualSavings: 0,
      monthlySavings: 0,
    }
  }

  const principal = oakwoodAsset.debt.principal
  const rate = oakwoodAsset.debt.interestRate / 100

  // Compound interest calculation
  const monthlyRate = rate / 12
  const futureValue = principal * Math.pow(1 + monthlyRate, monthsToClear)
  const interestAccrued = futureValue - principal

  return {
    oakwoodDebt: principal,
    annualSavings: interestAccrued,
    monthlySavings: interestAccrued / monthsToClear,
  }
}

/**
 * Run consolidation scenario
 */
export function runConsolidationScenario(
  assets: SovereignAsset[],
  cashInjection: number
): ConsolidationScenario {
  const oraHouse = assets.find((a) => a.id === 'ora-house')
  const parekklisia = assets.find((a) => a.id === 'parekklisia-land')
  const hotel = assets.find((a) => a.id === 'abbey-point-hotel')
  const lavenderHill = assets.find((a) => a.id === 'lavender-hill')
  const cafeRoyal = assets.find((a) => a.id === 'cafe-royal')
  const oakwood = assets.find((a) => a.id === 'oakwood-close')

  let remainingCash = cashInjection
  const buyoutPower: ConsolidationScenario['buyoutPower'] = {
    oraHouse: {
      canBuy: false,
      percentage: 0,
      cost: 0,
      remaining: 0,
    },
    parekklisia: {
      canBuy: false,
      percentage: 0,
      cost: 0,
      remaining: 0,
    },
    hotel: {
      canBuy: false,
      percentage: 0,
      cost: 0,
      remaining: 0,
    },
    lavenderHill: {
      canBuy: false,
      percentage: 0,
      cost: 0,
      remaining: 0,
    },
    cafeRoyal: {
      canBuy: false,
      percentage: 0,
      cost: 0,
      remaining: 0,
    },
  }

  // Priority 1: Clear Oakwood debt (if applicable)
  if (oakwood && oakwood.debt) {
    const oakwoodDebt = oakwood.debt.principal
    if (remainingCash >= oakwoodDebt) {
      remainingCash -= oakwoodDebt
    }
  }

  // Priority 2: Buyout Ora House
  if (oraHouse) {
    const buyout = calculateBuyoutPower(oraHouse, remainingCash)
    buyoutPower.oraHouse = buyout
    remainingCash -= buyout.cost
  }

  // Priority 3: Buyout Parekklisia
  if (parekklisia) {
    const buyout = calculateBuyoutPower(parekklisia, remainingCash)
    buyoutPower.parekklisia = buyout
    remainingCash -= buyout.cost
  }

  // Priority 4: Hotel (if cash remains)
  if (hotel) {
    const buyout = calculateBuyoutPower(hotel, remainingCash)
    buyoutPower.hotel = buyout
    remainingCash -= buyout.cost
  }

  // Priority 5: Lavender Hill (if cash remains)
  if (lavenderHill) {
    const buyout = calculateBuyoutPower(lavenderHill, remainingCash)
    buyoutPower.lavenderHill = buyout
    remainingCash -= buyout.cost
  }

  // Priority 6: Cafe Royal (if cash remains)
  if (cafeRoyal) {
    const buyout = calculateBuyoutPower(cafeRoyal, remainingCash)
    buyoutPower.cafeRoyal = buyout
    remainingCash -= buyout.cost
  }

  // Calculate interest savings
  const interestSaved = oakwood
    ? calculateInterestSavings(oakwood)
    : {
        oakwoodDebt: 0,
        annualSavings: 0,
        monthlySavings: 0,
      }

  const totalConsolidationCost =
    buyoutPower.oraHouse.cost +
    buyoutPower.parekklisia.cost +
    buyoutPower.hotel.cost +
    buyoutPower.lavenderHill.cost +
    buyoutPower.cafeRoyal.cost +
    (oakwood?.debt?.principal || 0)

  return {
    cashInjection,
    buyoutPower,
    interestSaved,
    totalConsolidationCost,
    remainingCash,
  }
}

