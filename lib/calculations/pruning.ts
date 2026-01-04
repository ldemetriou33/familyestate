/**
 * Abbey OS - Pruning Module
 * Tracks assets for sale with countdown timers
 */

import type { Asset, PruningAsset } from '@/lib/types/estate'

/**
 * Calculate days remaining until sell-by date
 */
export function calculateDaysRemaining(sellByDate: string): number {
  const today = new Date()
  const sellDate = new Date(sellByDate)
  const diffTime = sellDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Determine urgency level based on days remaining
 */
export function determineUrgency(daysRemaining: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
  if (daysRemaining < 90) return 'CRITICAL'
  if (daysRemaining < 180) return 'HIGH'
  return 'MEDIUM'
}

/**
 * Build pruning assets list from estate
 */
export function buildPruningAssets(assets: Asset[]): PruningAsset[] {
  const pruningAssets: PruningAsset[] = []

  for (const asset of assets) {
    if (asset.status === 'SELL' && asset.metadata?.sell_by_date) {
      const daysRemaining = calculateDaysRemaining(asset.metadata.sell_by_date)
      const urgency = determineUrgency(daysRemaining)

      pruningAssets.push({
        asset_id: asset.id,
        asset_name: asset.name,
        current_value: asset.valuation,
        sell_by_date: asset.metadata.sell_by_date,
        days_remaining: daysRemaining,
        urgency,
        reason: asset.metadata.notes || 'Strategic sale',
      })
    }
  }

  // Sort by urgency and days remaining
  return pruningAssets.sort((a, b) => {
    if (a.urgency !== b.urgency) {
      const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    }
    return a.days_remaining - b.days_remaining
  })
}

