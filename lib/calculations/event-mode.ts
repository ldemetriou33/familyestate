/**
 * Abbey OS - Wembley Event Mode Calculator
 * Calculates car park revenue based on event days
 */

import type { EventModeConfig } from '@/lib/types/estate'

/**
 * Calculate projected monthly yield for car park based on event days
 */
export function calculateEventModeYield(
  config: EventModeConfig,
  eventDates: string[] = []
): number {
  const daysInMonth = 30 // Simplified
  const normalDays = daysInMonth - eventDates.length
  const eventDays = eventDates.length

  const normalRevenue = normalDays * config.normal_daily_rate * config.spaces || 15
  const eventRevenue = eventDays * config.event_daily_rate * (config.spaces || 15)

  return normalRevenue + eventRevenue
}

/**
 * Calculate annual yield projection
 */
export function calculateAnnualEventModeYield(
  config: EventModeConfig,
  eventDatesPerMonth: number = 2 // Average
): number {
  const monthlyYield = calculateEventModeYield(config, [])
  // Rough estimate: 2 event days per month
  const eventDaysPerMonth = eventDatesPerMonth
  const normalDaysPerMonth = 30 - eventDaysPerMonth

  const normalRevenue = normalDaysPerMonth * config.normal_daily_rate * (config.spaces || 15)
  const eventRevenue = eventDaysPerMonth * config.event_daily_rate * (config.spaces || 15)

  return (normalRevenue + eventRevenue) * 12
}

/**
 * Get event dates for Wembley Stadium (placeholder for API integration)
 */
export async function getWembleyEventDates(year: number = new Date().getFullYear()): Promise<string[]> {
  // TODO: Integrate with Wembley Stadium API or calendar
  // For now, return placeholder dates
  const placeholderDates: string[] = []
  
  // Example: Add some common event dates (FA Cup Final, Champions League, etc.)
  // This would be replaced with actual API call
  
  return placeholderDates
}

