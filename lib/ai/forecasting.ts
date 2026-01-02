// Abbey OS - AI Forecasting Service
// Predicts future metrics based on historical patterns

import { DailyLog, Forecast, HotelMetrics, CafeMetrics } from '../types/abbey-os'

export interface ForecastResult {
  date: Date
  predictedValue: number
  lowerBound: number
  upperBound: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  factors: string[]
}

export interface OccupancyForecast extends ForecastResult {
  predictedOccupancy: number
  predictedADR: number
  predictedRevPAR: number
}

export interface RevenueForecast extends ForecastResult {
  breakdown: {
    hotel: number
    cafe: number
    residential: number
  }
}

/**
 * Simple exponential smoothing for time series forecasting
 * Alpha controls the weight of recent observations
 */
function exponentialSmoothing(data: number[], alpha: number = 0.3): number {
  if (data.length === 0) return 0
  if (data.length === 1) return data[0]

  let smoothed = data[0]
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed
  }
  return smoothed
}

/**
 * Calculate trend direction from recent data
 */
function calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
  if (data.length < 3) return 'stable'
  
  const recent = data.slice(-3)
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
  const older = data.slice(-6, -3)
  const avgOlder = older.length > 0 
    ? older.reduce((a, b) => a + b, 0) / older.length 
    : avgRecent

  const change = ((avgRecent - avgOlder) / avgOlder) * 100

  if (change > 5) return 'up'
  if (change < -5) return 'down'
  return 'stable'
}

/**
 * Calculate confidence level based on data variance
 */
function calculateConfidence(data: number[]): number {
  if (data.length < 2) return 0.5
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  const coefficientOfVariation = Math.sqrt(variance) / mean
  
  // Lower variance = higher confidence
  const confidence = Math.max(0.5, Math.min(0.95, 1 - coefficientOfVariation))
  return confidence
}

/**
 * Detect seasonality patterns (day of week effects)
 */
function detectSeasonality(data: number[], daysOfWeek: number[]): number[] {
  const dayAverages = Array(7).fill(0)
  const dayCounts = Array(7).fill(0)

  for (let i = 0; i < data.length; i++) {
    const day = daysOfWeek[i] || i % 7
    dayAverages[day] += data[i]
    dayCounts[day]++
  }

  return dayAverages.map((sum, i) => dayCounts[i] > 0 ? sum / dayCounts[i] : 0)
}

/**
 * Forecast hotel occupancy for the next N days
 */
export function forecastOccupancy(
  historicalData: { date: Date; occupancy: number; adr: number }[],
  daysAhead: number = 30
): OccupancyForecast[] {
  const occupancyData = historicalData.map(d => d.occupancy)
  const adrData = historicalData.map(d => d.adr)
  
  const baseOccupancy = exponentialSmoothing(occupancyData, 0.3)
  const baseADR = exponentialSmoothing(adrData, 0.2)
  const trend = calculateTrend(occupancyData)
  const confidence = calculateConfidence(occupancyData)

  // Day of week seasonality
  const daysOfWeek = historicalData.map(d => d.date.getDay())
  const seasonalFactors = detectSeasonality(occupancyData, daysOfWeek)
  const avgSeasonal = seasonalFactors.reduce((a, b) => a + b, 0) / 7

  const forecasts: OccupancyForecast[] = []
  const today = new Date()

  for (let i = 0; i < daysAhead; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(today.getDate() + i)
    
    const dayOfWeek = forecastDate.getDay()
    const seasonalAdjustment = avgSeasonal > 0 
      ? seasonalFactors[dayOfWeek] / avgSeasonal 
      : 1

    // Apply trend adjustment
    const trendAdjustment = trend === 'up' ? 1 + (i * 0.002) 
      : trend === 'down' ? 1 - (i * 0.002) 
      : 1

    // Add some randomness for realistic variation
    const randomFactor = 0.95 + Math.random() * 0.1

    const predictedOccupancy = Math.min(1, Math.max(0,
      baseOccupancy * seasonalAdjustment * trendAdjustment * randomFactor
    ))

    const predictedADR = baseADR * trendAdjustment * (0.98 + Math.random() * 0.04)
    const predictedRevPAR = predictedOccupancy * predictedADR

    // Calculate bounds
    const uncertainty = (1 - confidence) * 0.2
    const lowerBound = predictedOccupancy * (1 - uncertainty)
    const upperBound = Math.min(1, predictedOccupancy * (1 + uncertainty))

    forecasts.push({
      date: forecastDate,
      predictedValue: predictedOccupancy,
      predictedOccupancy,
      predictedADR,
      predictedRevPAR,
      lowerBound,
      upperBound,
      confidence: confidence - (i * 0.005), // Confidence decreases over time
      trend,
      factors: generateOccupancyFactors(predictedOccupancy, dayOfWeek, trend),
    })
  }

  return forecasts
}

/**
 * Forecast cafe revenue and covers
 */
export function forecastCafeRevenue(
  historicalData: { date: Date; sales: number; covers: number }[],
  daysAhead: number = 30
): ForecastResult[] {
  const salesData = historicalData.map(d => d.sales)
  const coversData = historicalData.map(d => d.covers)
  
  const baseSales = exponentialSmoothing(salesData, 0.3)
  const baseCovers = exponentialSmoothing(coversData, 0.3)
  const trend = calculateTrend(salesData)
  const confidence = calculateConfidence(salesData)

  const daysOfWeek = historicalData.map(d => d.date.getDay())
  const seasonalFactors = detectSeasonality(salesData, daysOfWeek)
  const avgSeasonal = seasonalFactors.reduce((a, b) => a + b, 0) / 7

  const forecasts: ForecastResult[] = []
  const today = new Date()

  for (let i = 0; i < daysAhead; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(today.getDate() + i)
    
    const dayOfWeek = forecastDate.getDay()
    const seasonalAdjustment = avgSeasonal > 0 
      ? seasonalFactors[dayOfWeek] / avgSeasonal 
      : 1

    const trendAdjustment = trend === 'up' ? 1 + (i * 0.001) 
      : trend === 'down' ? 1 - (i * 0.001) 
      : 1

    const randomFactor = 0.92 + Math.random() * 0.16

    const predictedSales = baseSales * seasonalAdjustment * trendAdjustment * randomFactor

    const uncertainty = (1 - confidence) * 0.25
    const lowerBound = predictedSales * (1 - uncertainty)
    const upperBound = predictedSales * (1 + uncertainty)

    forecasts.push({
      date: forecastDate,
      predictedValue: predictedSales,
      lowerBound,
      upperBound,
      confidence: confidence - (i * 0.005),
      trend,
      factors: generateCafeFactors(predictedSales, dayOfWeek, trend),
    })
  }

  return forecasts
}

/**
 * Forecast cashflow for the portfolio
 */
export function forecastCashflow(
  currentBalance: number,
  expectedInflows: { date: Date; amount: number; source: string }[],
  expectedOutflows: { date: Date; amount: number; category: string }[],
  daysAhead: number = 90
): ForecastResult[] {
  const forecasts: ForecastResult[] = []
  const today = new Date()
  let runningBalance = currentBalance

  for (let i = 0; i < daysAhead; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(today.getDate() + i)

    // Sum inflows for this day
    const dayInflows = expectedInflows
      .filter(inf => {
        const infDate = new Date(inf.date)
        return infDate.toDateString() === forecastDate.toDateString()
      })
      .reduce((sum, inf) => sum + inf.amount, 0)

    // Sum outflows for this day
    const dayOutflows = expectedOutflows
      .filter(out => {
        const outDate = new Date(out.date)
        return outDate.toDateString() === forecastDate.toDateString()
      })
      .reduce((sum, out) => sum + out.amount, 0)

    // Add estimated daily operational cashflow
    const estimatedDailyNet = 500 + Math.random() * 300 // Positive daily operations

    runningBalance += dayInflows - dayOutflows + estimatedDailyNet

    // Confidence decreases over time
    const confidence = Math.max(0.5, 0.95 - (i * 0.005))
    const uncertainty = (1 - confidence) * runningBalance * 0.1

    forecasts.push({
      date: forecastDate,
      predictedValue: runningBalance,
      lowerBound: runningBalance - uncertainty,
      upperBound: runningBalance + uncertainty,
      confidence,
      trend: runningBalance > currentBalance ? 'up' : runningBalance < currentBalance ? 'down' : 'stable',
      factors: [`Day ${i + 1}`, dayInflows > 0 ? `+£${dayInflows.toLocaleString()} inflow` : ''],
    })
  }

  return forecasts
}

/**
 * Generate human-readable factors affecting occupancy
 */
function generateOccupancyFactors(occupancy: number, dayOfWeek: number, trend: string): string[] {
  const factors: string[] = []
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  factors.push(`${dayNames[dayOfWeek]} pattern`)

  if (occupancy > 0.85) {
    factors.push('High demand period')
  } else if (occupancy < 0.5) {
    factors.push('Low season')
  }

  if (trend === 'up') {
    factors.push('Upward trend')
  } else if (trend === 'down') {
    factors.push('Declining bookings')
  }

  return factors
}

/**
 * Generate human-readable factors affecting cafe revenue
 */
function generateCafeFactors(sales: number, dayOfWeek: number, trend: string): string[] {
  const factors: string[] = []
  
  // Weekend vs weekday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    factors.push('Weekend boost')
  } else {
    factors.push('Weekday traffic')
  }

  if (trend === 'up') {
    factors.push('Growing customer base')
  } else if (trend === 'down') {
    factors.push('Seasonal decline')
  }

  return factors
}

/**
 * Generate mock historical data and return occupancy forecast
 * Helper function for components that don't have historical data
 */
export function getOccupancyForecast(currentOccupancy: number, daysAhead: number = 30): OccupancyForecast[] {
  // Generate mock historical data based on current occupancy
  const historicalData: { date: Date; occupancy: number; adr: number }[] = []
  const today = new Date()
  
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    
    // Add some realistic variation
    const dayOfWeek = date.getDay()
    const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6) ? 0.1 : 0
    const variation = (Math.random() - 0.5) * 0.15
    
    historicalData.push({
      date,
      occupancy: Math.min(1, Math.max(0.3, currentOccupancy + weekendBoost + variation)),
      adr: 95 + Math.random() * 30,
    })
  }
  
  return forecastOccupancy(historicalData, daysAhead)
}

/**
 * Generate mock historical data and return cafe revenue forecast
 * Helper function for components that don't have historical data
 */
export function getCafeRevenueForecast(currentDailySales: number, daysAhead: number = 30): ForecastResult[] {
  // Generate mock historical data based on current sales
  const historicalData: { date: Date; sales: number; covers: number }[] = []
  const today = new Date()
  
  for (let i = 30; i >= 1; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    
    // Add some realistic variation
    const dayOfWeek = date.getDay()
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1
    const variation = 0.85 + Math.random() * 0.3
    
    const sales = currentDailySales * weekendBoost * variation
    const avgSpend = 12 + Math.random() * 5
    
    historicalData.push({
      date,
      sales,
      covers: Math.round(sales / avgSpend),
    })
  }
  
  return forecastCafeRevenue(historicalData, daysAhead)
}
