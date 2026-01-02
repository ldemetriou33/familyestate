// Abbey OS - Predictive Alerts
// AI-powered early warning system that predicts problems before they occur

import { Alert, AlertSeverity, AlertCategory } from '../types/abbey-os'
import { ForecastResult, OccupancyForecast } from './forecasting'
import { BusinessContext } from './recommendations'

export interface PredictiveAlert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  category: AlertCategory
  predictedDate: Date
  daysUntil: number
  confidence: number
  recommendation: string
  preventativeActions: string[]
  estimatedImpact: number
}

/**
 * Generate predictive alerts based on forecasts and current trends
 */
export function generatePredictiveAlerts(
  context: BusinessContext,
  occupancyForecasts: OccupancyForecast[],
  cafeForecasts: ForecastResult[],
  cashflowForecasts: ForecastResult[]
): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = []

  // Check for low occupancy predictions
  const lowOccupancyAlerts = predictLowOccupancy(occupancyForecasts)
  alerts.push(...lowOccupancyAlerts)

  // Check for cash flow concerns
  const cashflowAlerts = predictCashflowIssues(cashflowForecasts, context.cashBalance)
  alerts.push(...cashflowAlerts)

  // Check for revenue decline
  const revenueAlerts = predictRevenueTrends(cafeForecasts)
  alerts.push(...revenueAlerts)

  // Check for seasonal patterns
  const seasonalAlerts = predictSeasonalChallenges()
  alerts.push(...seasonalAlerts)

  // Check for arrears escalation risk
  const arrearsAlerts = predictArrearsRisk(context)
  alerts.push(...arrearsAlerts)

  // Sort by days until (most urgent first)
  return alerts.sort((a, b) => a.daysUntil - b.daysUntil)
}

/**
 * Predict upcoming low occupancy periods
 */
function predictLowOccupancy(forecasts: OccupancyForecast[]): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = []
  const today = new Date()

  // Find periods with occupancy below 50%
  for (let i = 0; i < forecasts.length; i++) {
    const forecast = forecasts[i]
    if (forecast.predictedOccupancy < 0.5) {
      // Check if this is start of a low period
      const isNewLowPeriod = i === 0 || forecasts[i - 1].predictedOccupancy >= 0.5

      if (isNewLowPeriod) {
        // Count consecutive low days
        let lowDays = 1
        for (let j = i + 1; j < forecasts.length && forecasts[j].predictedOccupancy < 0.5; j++) {
          lowDays++
        }

        const daysUntil = Math.floor((forecast.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const avgOccupancy = forecasts.slice(i, i + lowDays).reduce((sum, f) => sum + f.predictedOccupancy, 0) / lowDays
        const revenueImpact = (0.75 - avgOccupancy) * 24 * lowDays * 250 // Assumed 24 rooms, £250 ADR

        if (daysUntil >= 3 && lowDays >= 3) {
          alerts.push({
            id: `pred-occupancy-${i}`,
            title: 'Low Occupancy Period Predicted',
            message: `Occupancy forecast to drop to ${(avgOccupancy * 100).toFixed(0)}% for ${lowDays} days starting ${forecast.date.toLocaleDateString('en-GB')}`,
            severity: avgOccupancy < 0.4 ? 'CRITICAL' : 'WARNING',
            category: 'OCCUPANCY',
            predictedDate: forecast.date,
            daysUntil,
            confidence: forecast.confidence,
            recommendation: 'Launch promotional campaign now to boost bookings',
            preventativeActions: [
              'Create flash sale for affected dates',
              'Contact past guests with special offers',
              'Adjust OTA minimum stays',
              'Launch social media campaign',
              'Partner with local events',
            ],
            estimatedImpact: revenueImpact,
          })
        }
      }
    }
  }

  return alerts
}

/**
 * Predict cash flow issues
 */
function predictCashflowIssues(forecasts: ForecastResult[], currentBalance: number): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = []
  const today = new Date()

  // Find minimum cash position in forecast
  let minCash = currentBalance
  let minDate = today
  let minIndex = 0

  forecasts.forEach((forecast, index) => {
    if (forecast.predictedValue < minCash) {
      minCash = forecast.predictedValue
      minDate = forecast.date
      minIndex = index
    }
  })

  // Alert if cash drops below safety threshold
  const safetyThreshold = 50000 // £50k minimum

  if (minCash < safetyThreshold) {
    const daysUntil = Math.floor((minDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    alerts.push({
      id: 'pred-cashflow-low',
      title: 'Cash Position Warning',
      message: `Cash balance predicted to drop to ${minCash.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })} around ${minDate.toLocaleDateString('en-GB')}`,
      severity: minCash < 25000 ? 'CRITICAL' : 'WARNING',
      category: 'FINANCIAL',
      predictedDate: minDate,
      daysUntil: Math.max(1, daysUntil),
      confidence: forecasts[minIndex]?.confidence || 0.7,
      recommendation: 'Review upcoming expenses and accelerate receivables',
      preventativeActions: [
        'Defer non-essential expenditure',
        'Accelerate rent collection',
        'Review payment terms with suppliers',
        'Consider drawing on credit facility',
        'Prioritise cash-generating activities',
      ],
      estimatedImpact: safetyThreshold - minCash,
    })
  }

  return alerts
}

/**
 * Predict revenue trends
 */
function predictRevenueTrends(forecasts: ForecastResult[]): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = []

  if (forecasts.length < 14) return alerts

  // Compare first week to second week
  const week1 = forecasts.slice(0, 7)
  const week2 = forecasts.slice(7, 14)

  const week1Avg = week1.reduce((sum, f) => sum + f.predictedValue, 0) / 7
  const week2Avg = week2.reduce((sum, f) => sum + f.predictedValue, 0) / 7

  const decline = ((week1Avg - week2Avg) / week1Avg) * 100

  if (decline > 10) {
    alerts.push({
      id: 'pred-revenue-decline',
      title: 'Revenue Decline Predicted',
      message: `Cafe revenue forecast to decline ${decline.toFixed(0)}% next week`,
      severity: decline > 20 ? 'CRITICAL' : 'WARNING',
      category: 'FINANCIAL',
      predictedDate: new Date(Date.now() + 7 * 86400000),
      daysUntil: 7,
      confidence: 0.75,
      recommendation: 'Review marketing and operational factors',
      preventativeActions: [
        'Launch promotional offers',
        'Review menu pricing',
        'Increase social media presence',
        'Check for local events affecting footfall',
        'Consider special events or promotions',
      ],
      estimatedImpact: (week1Avg - week2Avg) * 7,
    })
  }

  return alerts
}

/**
 * Predict seasonal challenges
 */
function predictSeasonalChallenges(): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = []
  const today = new Date()
  const month = today.getMonth() // 0-11

  // January blues warning
  if (month === 11 || month === 0) { // December or January
    alerts.push({
      id: 'pred-seasonal-jan',
      title: 'January Slowdown Approaching',
      message: 'Historical data shows January is typically the slowest month for hospitality',
      severity: 'INFO',
      category: 'OPERATIONAL',
      predictedDate: new Date(today.getFullYear() + (month === 11 ? 1 : 0), 0, 15),
      daysUntil: month === 11 ? 30 : 15,
      confidence: 0.85,
      recommendation: 'Prepare promotional campaigns and cost controls',
      preventativeActions: [
        'Pre-plan January promotions',
        'Review staffing levels',
        'Prepare special offers for regulars',
        'Consider dry January alternatives',
        'Plan maintenance during quieter periods',
      ],
      estimatedImpact: 15000, // Estimated monthly impact
    })
  }

  return alerts
}

/**
 * Predict arrears escalation risk
 */
function predictArrearsRisk(context: BusinessContext): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = []

  // If current arrears are already elevated, predict escalation
  const arrearsRatio = (context.arrearsTotal / context.rentRoll) * 100

  if (arrearsRatio > 5 && arrearsRatio < 15) {
    // Model arrears growth if no action taken
    const projectedArrears = context.arrearsTotal * 1.5 // 50% growth assumption
    const projectedRatio = (projectedArrears / context.rentRoll) * 100

    alerts.push({
      id: 'pred-arrears-escalation',
      title: 'Arrears Escalation Risk',
      message: `Without intervention, arrears could reach £${projectedArrears.toLocaleString()} (${projectedRatio.toFixed(0)}% of rent roll) within 30 days`,
      severity: 'WARNING',
      category: 'FINANCIAL',
      predictedDate: new Date(Date.now() + 30 * 86400000),
      daysUntil: 30,
      confidence: 0.7,
      recommendation: 'Implement immediate arrears recovery process',
      preventativeActions: [
        'Contact all tenants in arrears today',
        'Offer payment plans',
        'Issue formal notices where required',
        'Review tenant financial circumstances',
        'Consider early intervention strategies',
      ],
      estimatedImpact: projectedArrears - context.arrearsTotal,
    })
  }

  return alerts
}

/**
 * Convert predictive alert to standard alert format
 */
export function predictiveAlertToAlert(pred: PredictiveAlert): Alert {
  return {
    id: pred.id,
    title: `🔮 ${pred.title}`,
    message: `${pred.message} (${pred.daysUntil} days away, ${(pred.confidence * 100).toFixed(0)}% confidence)`,
    severity: pred.severity,
    category: pred.category,
    isRead: false,
    isDismissed: false,
    source: 'AI_PREDICTION',
    createdAt: new Date(),
  }
}

