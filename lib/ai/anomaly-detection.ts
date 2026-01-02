// Abbey OS - AI Anomaly Detection Engine
// Identifies unusual patterns, risks, and opportunities

import { Alert, AlertSeverity, AlertCategory } from '../types/abbey-os'

export interface Anomaly {
  id: string
  type: 'spike' | 'drop' | 'trend_break' | 'threshold_breach' | 'pattern_deviation'
  metric: string
  severity: AlertSeverity
  category: AlertCategory
  currentValue: number
  expectedValue: number
  deviation: number // Percentage deviation from expected
  message: string
  recommendation: string
  detectedAt: Date
  confidence: number
}

export interface AnomalyConfig {
  metric: string
  warningThreshold: number // Percentage deviation for warning
  criticalThreshold: number // Percentage deviation for critical
  minDataPoints: number
  lookbackPeriod: number // Days
}

const DEFAULT_CONFIGS: AnomalyConfig[] = [
  { metric: 'occupancy', warningThreshold: 15, criticalThreshold: 30, minDataPoints: 7, lookbackPeriod: 30 },
  { metric: 'revenue', warningThreshold: 20, criticalThreshold: 35, minDataPoints: 7, lookbackPeriod: 30 },
  { metric: 'cafe_margin', warningThreshold: 10, criticalThreshold: 20, minDataPoints: 7, lookbackPeriod: 14 },
  { metric: 'labor_cost', warningThreshold: 15, criticalThreshold: 25, minDataPoints: 7, lookbackPeriod: 14 },
  { metric: 'arrears', warningThreshold: 50, criticalThreshold: 100, minDataPoints: 3, lookbackPeriod: 90 },
]

/**
 * Calculate mean and standard deviation
 */
function calculateStats(data: number[]): { mean: number; stdDev: number } {
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  return { mean, stdDev: Math.sqrt(variance) }
}

/**
 * Calculate z-score for anomaly detection
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

/**
 * Detect anomalies in a time series
 */
export function detectTimeSeriesAnomalies(
  data: { date: Date; value: number }[],
  metric: string,
  config?: Partial<AnomalyConfig>
): Anomaly[] {
  const fullConfig = {
    ...DEFAULT_CONFIGS.find(c => c.metric === metric) || DEFAULT_CONFIGS[0],
    ...config,
    metric,
  }

  if (data.length < fullConfig.minDataPoints) {
    return []
  }

  const anomalies: Anomaly[] = []
  const values = data.map(d => d.value)
  const { mean, stdDev } = calculateStats(values)

  // Check each data point
  data.forEach((point, index) => {
    const zScore = calculateZScore(point.value, mean, stdDev)
    const deviation = ((point.value - mean) / mean) * 100

    // Check for spikes (unusually high)
    if (zScore > 2) {
      const severity: AlertSeverity = Math.abs(deviation) > fullConfig.criticalThreshold ? 'CRITICAL' : 'WARNING'
      anomalies.push({
        id: `anomaly-${metric}-spike-${index}`,
        type: 'spike',
        metric,
        severity,
        category: getCategoryForMetric(metric),
        currentValue: point.value,
        expectedValue: mean,
        deviation,
        message: `${formatMetricName(metric)} spiked ${Math.abs(deviation).toFixed(1)}% above normal`,
        recommendation: getRecommendationForAnomaly('spike', metric, deviation),
        detectedAt: point.date,
        confidence: Math.min(0.95, 0.7 + Math.abs(zScore) * 0.1),
      })
    }

    // Check for drops (unusually low)
    if (zScore < -2) {
      const severity: AlertSeverity = Math.abs(deviation) > fullConfig.criticalThreshold ? 'CRITICAL' : 'WARNING'
      anomalies.push({
        id: `anomaly-${metric}-drop-${index}`,
        type: 'drop',
        metric,
        severity,
        category: getCategoryForMetric(metric),
        currentValue: point.value,
        expectedValue: mean,
        deviation,
        message: `${formatMetricName(metric)} dropped ${Math.abs(deviation).toFixed(1)}% below normal`,
        recommendation: getRecommendationForAnomaly('drop', metric, deviation),
        detectedAt: point.date,
        confidence: Math.min(0.95, 0.7 + Math.abs(zScore) * 0.1),
      })
    }
  })

  // Check for trend breaks
  const trendAnomaly = detectTrendBreak(data, metric, fullConfig)
  if (trendAnomaly) {
    anomalies.push(trendAnomaly)
  }

  return anomalies
}

/**
 * Detect sudden changes in trend
 */
function detectTrendBreak(
  data: { date: Date; value: number }[],
  metric: string,
  config: AnomalyConfig
): Anomaly | null {
  if (data.length < 14) return null

  const recentWeek = data.slice(-7).map(d => d.value)
  const previousWeek = data.slice(-14, -7).map(d => d.value)

  const recentAvg = recentWeek.reduce((a, b) => a + b, 0) / recentWeek.length
  const previousAvg = previousWeek.reduce((a, b) => a + b, 0) / previousWeek.length

  const change = ((recentAvg - previousAvg) / previousAvg) * 100

  if (Math.abs(change) > config.warningThreshold) {
    return {
      id: `anomaly-${metric}-trend-${Date.now()}`,
      type: 'trend_break',
      metric,
      severity: Math.abs(change) > config.criticalThreshold ? 'CRITICAL' : 'WARNING',
      category: getCategoryForMetric(metric),
      currentValue: recentAvg,
      expectedValue: previousAvg,
      deviation: change,
      message: `${formatMetricName(metric)} ${change > 0 ? 'increased' : 'decreased'} ${Math.abs(change).toFixed(1)}% week-over-week`,
      recommendation: getRecommendationForAnomaly('trend_break', metric, change),
      detectedAt: new Date(),
      confidence: 0.85,
    }
  }

  return null
}

/**
 * Detect threshold breaches against targets
 */
export function detectThresholdBreach(
  currentValue: number,
  target: number,
  metric: string,
  isUpperBound: boolean = false
): Anomaly | null {
  const deviation = ((currentValue - target) / target) * 100
  const breached = isUpperBound ? currentValue > target : currentValue < target

  if (!breached) return null

  const severity: AlertSeverity = Math.abs(deviation) > 20 ? 'CRITICAL' : 'WARNING'

  return {
    id: `anomaly-${metric}-threshold-${Date.now()}`,
    type: 'threshold_breach',
    metric,
    severity,
    category: getCategoryForMetric(metric),
    currentValue,
    expectedValue: target,
    deviation,
    message: `${formatMetricName(metric)} ${isUpperBound ? 'exceeded' : 'fell below'} target by ${Math.abs(deviation).toFixed(1)}%`,
    recommendation: getRecommendationForAnomaly('threshold_breach', metric, deviation),
    detectedAt: new Date(),
    confidence: 0.95,
  }
}

/**
 * Analyze portfolio for financial risks
 */
export function detectFinancialRisks(
  arrears: number,
  totalRentRoll: number,
  cashBalance: number,
  monthlyOutflows: number
): Anomaly[] {
  const anomalies: Anomaly[] = []

  // Arrears ratio
  const arrearsRatio = (arrears / totalRentRoll) * 100
  if (arrearsRatio > 10) {
    anomalies.push({
      id: 'risk-arrears-ratio',
      type: 'threshold_breach',
      metric: 'arrears_ratio',
      severity: arrearsRatio > 20 ? 'CRITICAL' : 'WARNING',
      category: 'FINANCIAL',
      currentValue: arrearsRatio,
      expectedValue: 5, // Target < 5%
      deviation: arrearsRatio - 5,
      message: `Arrears at ${arrearsRatio.toFixed(1)}% of rent roll (target: <5%)`,
      recommendation: 'Initiate arrears recovery process. Consider payment plans for affected tenants.',
      detectedAt: new Date(),
      confidence: 0.95,
    })
  }

  // Cash runway
  const runwayMonths = cashBalance / monthlyOutflows
  if (runwayMonths < 3) {
    anomalies.push({
      id: 'risk-cash-runway',
      type: 'threshold_breach',
      metric: 'cash_runway',
      severity: runwayMonths < 2 ? 'CRITICAL' : 'WARNING',
      category: 'FINANCIAL',
      currentValue: runwayMonths,
      expectedValue: 6, // Target 6 months
      deviation: ((runwayMonths - 6) / 6) * 100,
      message: `Cash runway at ${runwayMonths.toFixed(1)} months (target: 6 months)`,
      recommendation: 'Review upcoming expenses. Consider delaying non-essential capex.',
      detectedAt: new Date(),
      confidence: 0.9,
    })
  }

  return anomalies
}

/**
 * Helper functions
 */
function getCategoryForMetric(metric: string): AlertCategory {
  const categoryMap: Record<string, AlertCategory> = {
    occupancy: 'OCCUPANCY',
    revenue: 'FINANCIAL',
    cafe_margin: 'OPERATIONAL',
    labor_cost: 'OPERATIONAL',
    arrears: 'FINANCIAL',
    maintenance: 'MAINTENANCE',
  }
  return categoryMap[metric] || 'OPERATIONAL'
}

function formatMetricName(metric: string): string {
  const nameMap: Record<string, string> = {
    occupancy: 'Hotel Occupancy',
    revenue: 'Revenue',
    cafe_margin: 'Cafe Margin',
    labor_cost: 'Labour Cost',
    arrears: 'Rent Arrears',
    cash_runway: 'Cash Runway',
    arrears_ratio: 'Arrears Ratio',
  }
  return nameMap[metric] || metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getRecommendationForAnomaly(type: string, metric: string, deviation: number): string {
  const recommendations: Record<string, Record<string, string>> = {
    spike: {
      occupancy: 'Consider increasing rates to capitalise on high demand.',
      revenue: 'Investigate source of increased revenue. Sustain if from core business.',
      labor_cost: 'Review staffing levels. Check for overtime or agency costs.',
      arrears: 'Urgent: Review new arrears cases and initiate contact.',
    },
    drop: {
      occupancy: 'Activate promotional campaigns. Review competitor pricing.',
      revenue: 'Analyse revenue streams. Check for booking cancellations.',
      cafe_margin: 'Review food costs and supplier contracts. Check for waste.',
      labor_cost: 'Check for understaffing issues affecting service quality.',
    },
    trend_break: {
      occupancy: deviation > 0 
        ? 'Positive trend detected. Consider rate optimisation.'
        : 'Negative trend detected. Investigate root cause and activate marketing.',
      revenue: deviation > 0
        ? 'Revenue growth detected. Analyse drivers to sustain.'
        : 'Revenue decline detected. Review all business units.',
    },
    threshold_breach: {
      cafe_margin: 'Margin below target. Review menu pricing and supplier costs.',
      arrears_ratio: 'Arrears above acceptable level. Prioritise collection efforts.',
      cash_runway: 'Cash reserves low. Defer non-essential expenditure.',
    },
  }

  return recommendations[type]?.[metric] || 'Review the affected area and take corrective action.'
}

