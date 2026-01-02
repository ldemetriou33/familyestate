// Abbey OS - AI Module Entry Point
// Exports all AI services

export * from './forecasting'
export * from './anomaly-detection'
export * from './recommendations'
export * from './predictive-alerts'

import { forecastOccupancy, forecastCafeRevenue, forecastCashflow } from './forecasting'
import { detectTimeSeriesAnomalies, detectThresholdBreach, detectFinancialRisks } from './anomaly-detection'
import { generateRecommendations, BusinessContext, AIRecommendation } from './recommendations'

export interface AIInsights {
  recommendations: AIRecommendation[]
  anomalies: ReturnType<typeof detectTimeSeriesAnomalies>
  forecasts: {
    occupancy: ReturnType<typeof forecastOccupancy>
    cafe: ReturnType<typeof forecastCafeRevenue>
    cashflow: ReturnType<typeof forecastCashflow>
  }
  healthScore: number
  summary: string
}

/**
 * Generate comprehensive AI insights for the dashboard
 */
export function generateAIInsights(context: BusinessContext): AIInsights {
  // Generate recommendations
  const recommendations = generateRecommendations(context)

  // Generate mock historical data for anomaly detection
  const mockOccupancyHistory = generateMockHistory(30, context.hotelOccupancy, 0.1)
  const mockCafeHistory = generateMockHistory(30, context.cafeSales, 0.15)

  // Detect anomalies
  const occupancyAnomalies = detectTimeSeriesAnomalies(
    mockOccupancyHistory.map((v, i) => ({ date: new Date(Date.now() - (30 - i) * 86400000), value: v })),
    'occupancy'
  )

  const cafeAnomalies = detectTimeSeriesAnomalies(
    mockCafeHistory.map((v, i) => ({ date: new Date(Date.now() - (30 - i) * 86400000), value: v })),
    'cafe_sales'
  )

  // Financial risk detection
  const financialRisks = detectFinancialRisks(
    context.arrearsTotal,
    context.rentRoll,
    context.cashBalance,
    context.rentRoll * 0.6 // Estimated monthly outflows
  )

  // Combine all anomalies
  const anomalies = [...occupancyAnomalies, ...cafeAnomalies, ...financialRisks]

  // Generate forecasts with mock historical data
  const occupancyForecasts = forecastOccupancy(
    mockOccupancyHistory.map((v, i) => ({
      date: new Date(Date.now() - (30 - i) * 86400000),
      occupancy: v,
      adr: context.hotelADR * (0.9 + Math.random() * 0.2),
    })),
    30
  )

  const cafeForecasts = forecastCafeRevenue(
    mockCafeHistory.map((v, i) => ({
      date: new Date(Date.now() - (30 - i) * 86400000),
      sales: v,
      covers: Math.floor(v / 20), // Avg £20 per cover
    })),
    30
  )

  const cashflowForecasts = forecastCashflow(
    context.cashBalance,
    [
      { date: new Date(Date.now() + 5 * 86400000), amount: context.rentRoll, source: 'Rent Collection' },
    ],
    [
      { date: new Date(Date.now() + 10 * 86400000), amount: 52500, category: 'Mortgage' },
      { date: new Date(Date.now() + 15 * 86400000), amount: 8500, category: 'Payroll' },
    ],
    90
  )

  // Calculate overall health score (0-100)
  const healthScore = calculateHealthScore(context, anomalies.length, recommendations)

  // Generate summary
  const summary = generateSummary(healthScore, recommendations, anomalies)

  return {
    recommendations,
    anomalies,
    forecasts: {
      occupancy: occupancyForecasts,
      cafe: cafeForecasts,
      cashflow: cashflowForecasts,
    },
    healthScore,
    summary,
  }
}

/**
 * Generate mock historical data for testing
 */
function generateMockHistory(days: number, baseValue: number, variance: number): number[] {
  const history: number[] = []
  let value = baseValue

  for (let i = 0; i < days; i++) {
    // Random walk with mean reversion
    const change = (Math.random() - 0.5) * variance * baseValue
    const meanReversion = (baseValue - value) * 0.1
    value = Math.max(0, value + change + meanReversion)
    history.push(value)
  }

  return history
}

/**
 * Calculate overall portfolio health score
 */
function calculateHealthScore(
  context: BusinessContext,
  anomalyCount: number,
  recommendations: AIRecommendation[]
): number {
  let score = 100

  // Occupancy penalty
  if (context.hotelOccupancy < 0.6) score -= 15
  else if (context.hotelOccupancy < 0.7) score -= 10
  else if (context.hotelOccupancy < 0.75) score -= 5

  // Cafe margin penalty
  if (context.cafeMargin < 55) score -= 15
  else if (context.cafeMargin < 60) score -= 10
  else if (context.cafeMargin < 65) score -= 5

  // Arrears penalty
  const arrearsRatio = (context.arrearsTotal / context.rentRoll) * 100
  if (arrearsRatio > 20) score -= 20
  else if (arrearsRatio > 10) score -= 10
  else if (arrearsRatio > 5) score -= 5

  // Vacancy penalty
  if (context.vacantUnits > 2) score -= 10
  else if (context.vacantUnits > 0) score -= 5

  // Compliance penalty
  score -= context.complianceIssues * 5

  // Maintenance penalty
  score -= context.maintenanceIssues * 3

  // Anomaly penalty
  score -= Math.min(15, anomalyCount * 3)

  // High priority recommendations penalty
  const highPriorityCount = recommendations.filter(r => r.priority === 'HIGH').length
  score -= Math.min(10, highPriorityCount * 2)

  return Math.max(0, Math.min(100, score))
}

/**
 * Generate human-readable summary
 */
function generateSummary(
  healthScore: number,
  recommendations: AIRecommendation[],
  anomalies: any[]
): string {
  const highPriorityCount = recommendations.filter(r => r.priority === 'HIGH').length
  const totalImpact = recommendations.reduce((sum, r) => sum + r.estimatedImpact, 0)

  let status = ''
  if (healthScore >= 80) status = 'Portfolio is performing well.'
  else if (healthScore >= 60) status = 'Portfolio needs attention in some areas.'
  else if (healthScore >= 40) status = 'Multiple issues require immediate action.'
  else status = 'Critical attention required across the portfolio.'

  return `${status} ${highPriorityCount} high-priority actions identified with £${Math.round(totalImpact).toLocaleString()} potential impact. ${anomalies.length} anomalies detected.`
}

