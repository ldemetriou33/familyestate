/**
 * Abbey OS - Consolidation Roadmap Calculator
 * Step-by-step path to 100% ownership of Core 4 assets
 */

import type {
  Asset,
  ConsolidationRoadmap,
  ConsolidationStep,
  Ownership,
} from '@/lib/types/estate'
import { calculateConsolidationScenario } from './sovereign-equity'

/**
 * Build consolidation roadmap for Core 4 assets
 */
export function buildConsolidationRoadmap(
  assets: Asset[],
  minorityDiscountFactor: number = 0.7
): ConsolidationRoadmap {
  // Filter Core 4 assets
  const coreAssets = assets.filter((asset) => asset.metadata?.is_core_asset === true)

  // Sort by priority (Ora and Parekklisia first as they're smaller)
  const sortedCoreAssets = coreAssets.sort((a, b) => {
    // Cyprus assets first (smaller, easier to consolidate)
    if (a.country === 'CYPRUS' && b.country !== 'CYPRUS') return -1
    if (a.country !== 'CYPRUS' && b.country === 'CYPRUS') return 1
    // Then by valuation (smaller first)
    return a.valuation - b.valuation
  })

  const steps: ConsolidationStep[] = []
  let totalBuyoutCost = 0

  for (let i = 0; i < sortedCoreAssets.length; i++) {
    const asset = sortedCoreAssets[i]
    const scenario = calculateConsolidationScenario(asset, minorityDiscountFactor)

    // Determine priority
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    if (asset.country === 'CYPRUS') {
      priority = 'HIGH' // Cyprus assets are strategic
    } else if (asset.valuation > 5_000_000) {
      priority = 'LOW' // Large assets take longer
    }

    steps.push({
      step_number: i + 1,
      asset_id: asset.id,
      asset_name: asset.name,
      current_ownership: asset.ownership.dad_share * 100,
      target_ownership: 100,
      buyout_cost: scenario.buyout_cost,
      priority,
      status: 'PENDING',
    })

    totalBuyoutCost += scenario.buyout_cost
  }

  // Estimate timeline (6 months per step, adjusted by priority)
  const estimatedMonths = steps.reduce((total, step) => {
    const monthsForStep = step.priority === 'HIGH' ? 4 : step.priority === 'MEDIUM' ? 6 : 12
    return total + monthsForStep
  }, 0)

  return {
    core_assets: sortedCoreAssets,
    total_buyout_cost: totalBuyoutCost,
    steps,
    estimated_timeline_months: estimatedMonths,
    current_progress: 0, // Will be updated as steps complete
  }
}

/**
 * Calculate Mymms sale impact on consolidation
 */
export function calculateMymmsSaleImpact(
  mymmsSalePrice: number,
  mymmsDebt: number,
  oakwoodDebt: number,
  consolidationCost: number
): {
  profit: number
  oakwoodPayoff: number
  remainingForConsolidation: number
  canCompleteConsolidation: boolean
} {
  const profit = mymmsSalePrice - mymmsDebt
  const oakwoodPayoff = Math.min(profit, oakwoodDebt)
  const remainingForConsolidation = profit - oakwoodPayoff
  const canCompleteConsolidation = remainingForConsolidation >= consolidationCost

  return {
    profit,
    oakwoodPayoff,
    remainingForConsolidation,
    canCompleteConsolidation,
  }
}

