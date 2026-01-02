// Abbey OS - AI Recommendation Engine
// Generates intelligent action recommendations based on data analysis

import { ActionItem, Priority, Anomaly } from '../types/abbey-os'

export interface AIRecommendation {
  id: string
  title: string
  description: string
  priority: Priority
  category: string
  estimatedImpact: number // £ value
  confidence: number
  reasoning: string[]
  suggestedActions: string[]
  deadline?: Date
  relatedMetrics: string[]
}

export interface BusinessContext {
  hotelOccupancy: number
  hotelADR: number
  cafeMargin: number
  cafeSales: number
  arrearsTotal: number
  rentRoll: number
  cashBalance: number
  vacantUnits: number
  maintenanceIssues: number
  complianceIssues: number
}

/**
 * Generate AI recommendations based on current business context
 */
export function generateRecommendations(context: BusinessContext): AIRecommendation[] {
  const recommendations: AIRecommendation[] = []

  // Occupancy-based recommendations
  if (context.hotelOccupancy < 0.6) {
    recommendations.push({
      id: 'rec-occupancy-low',
      title: 'Launch Promotional Campaign',
      description: 'Hotel occupancy is below 60%. Consider targeted promotions to boost bookings.',
      priority: 'HIGH',
      category: 'Revenue',
      estimatedImpact: calculateOccupancyImpact(context.hotelOccupancy, context.hotelADR, 0.75),
      confidence: 0.85,
      reasoning: [
        `Current occupancy at ${(context.hotelOccupancy * 100).toFixed(0)}%`,
        'Below optimal threshold of 75%',
        'Promotional campaigns typically yield 10-15% occupancy increase',
      ],
      suggestedActions: [
        'Create 15% off promotion for 3+ night stays',
        'Partner with local attractions for package deals',
        'Launch email campaign to past guests',
        'Update OTA listings with promotional rates',
      ],
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      relatedMetrics: ['occupancy', 'revenue', 'adr'],
    })
  } else if (context.hotelOccupancy > 0.9) {
    recommendations.push({
      id: 'rec-occupancy-high',
      title: 'Optimise Room Rates',
      description: 'High occupancy detected. Consider increasing rates to maximise revenue.',
      priority: 'MEDIUM',
      category: 'Revenue',
      estimatedImpact: calculateRateOptimisationImpact(context.hotelADR, 0.1),
      confidence: 0.8,
      reasoning: [
        `Current occupancy at ${(context.hotelOccupancy * 100).toFixed(0)}%`,
        'High demand allows for rate increases',
        'Opportunity to increase ADR by 5-10%',
      ],
      suggestedActions: [
        'Review competitor pricing',
        'Increase BAR by 5-10%',
        'Add premium packages',
        'Enable minimum stay restrictions',
      ],
      relatedMetrics: ['occupancy', 'adr', 'revpar'],
    })
  }

  // Cafe margin recommendations
  if (context.cafeMargin < 60) {
    recommendations.push({
      id: 'rec-cafe-margin',
      title: 'Review Cafe Cost Structure',
      description: `Cafe margin at ${context.cafeMargin}% is below 60% target. Investigate cost drivers.`,
      priority: 'HIGH',
      category: 'Operations',
      estimatedImpact: calculateMarginImpact(context.cafeSales, context.cafeMargin, 65),
      confidence: 0.9,
      reasoning: [
        `Current margin: ${context.cafeMargin}%`,
        'Target margin: 65%',
        'Food cost appears elevated',
      ],
      suggestedActions: [
        'Audit food costs by supplier',
        'Review menu item profitability',
        'Check for wastage in kitchen',
        'Renegotiate supplier contracts',
        'Consider menu price adjustments',
      ],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      relatedMetrics: ['cafe_margin', 'food_cost', 'labor_cost'],
    })
  }

  // Arrears recommendations
  if (context.arrearsTotal > 0) {
    const arrearsRatio = (context.arrearsTotal / context.rentRoll) * 100
    if (arrearsRatio > 10) {
      recommendations.push({
        id: 'rec-arrears-critical',
        title: 'Urgent Arrears Recovery',
        description: `Arrears at £${context.arrearsTotal.toLocaleString()} (${arrearsRatio.toFixed(1)}% of rent roll)`,
        priority: 'HIGH',
        category: 'Finance',
        estimatedImpact: context.arrearsTotal,
        confidence: 0.95,
        reasoning: [
          `Total arrears: £${context.arrearsTotal.toLocaleString()}`,
          `${arrearsRatio.toFixed(1)}% of monthly rent roll`,
          'Exceeds 10% threshold requiring immediate action',
        ],
        suggestedActions: [
          'Contact all tenants in arrears immediately',
          'Issue formal arrears letters',
          'Offer payment plans where appropriate',
          'Consider legal action for persistent cases',
          'Review tenant screening process',
        ],
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        relatedMetrics: ['arrears', 'rent_roll', 'payment_status'],
      })
    }
  }

  // Vacant units recommendations
  if (context.vacantUnits > 0) {
    recommendations.push({
      id: 'rec-vacant-units',
      title: 'Market Vacant Properties',
      description: `${context.vacantUnits} unit(s) currently vacant. Potential revenue loss.`,
      priority: context.vacantUnits > 2 ? 'HIGH' : 'MEDIUM',
      category: 'Lettings',
      estimatedImpact: estimateVoidLoss(context.vacantUnits, context.rentRoll / 8), // Assuming 8 total units
      confidence: 0.9,
      reasoning: [
        `${context.vacantUnits} vacant unit(s)`,
        'Each void day = lost rental income',
        'Average time to let: 2-4 weeks',
      ],
      suggestedActions: [
        'List on major property portals',
        'Arrange professional photography',
        'Consider competitive pricing',
        'Schedule open viewing days',
        'Review marketing materials',
      ],
      relatedMetrics: ['occupancy', 'rent_roll', 'void_period'],
    })
  }

  // Compliance recommendations
  if (context.complianceIssues > 0) {
    recommendations.push({
      id: 'rec-compliance',
      title: 'Address Compliance Issues',
      description: `${context.complianceIssues} compliance issue(s) requiring attention.`,
      priority: 'HIGH',
      category: 'Compliance',
      estimatedImpact: context.complianceIssues * 5000, // Potential fine per issue
      confidence: 0.95,
      reasoning: [
        'Compliance failures can result in fines',
        'Legal obligations must be met',
        'Tenant safety is paramount',
      ],
      suggestedActions: [
        'Review all expiring certificates',
        'Book required inspections',
        'Update compliance tracker',
        'Set calendar reminders',
      ],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      relatedMetrics: ['compliance', 'gas_certs', 'epc'],
    })
  }

  // Cash position recommendations
  const monthlyBurn = context.rentRoll * 0.8 // Rough estimate
  const runwayMonths = context.cashBalance / monthlyBurn
  if (runwayMonths < 3) {
    recommendations.push({
      id: 'rec-cash-runway',
      title: 'Strengthen Cash Position',
      description: `Cash runway at ${runwayMonths.toFixed(1)} months. Consider building reserves.`,
      priority: 'HIGH',
      category: 'Finance',
      estimatedImpact: monthlyBurn * 3, // 3 months of runway
      confidence: 0.85,
      reasoning: [
        `Current cash: £${context.cashBalance.toLocaleString()}`,
        `Estimated monthly burn: £${monthlyBurn.toLocaleString()}`,
        'Target runway: 6 months minimum',
      ],
      suggestedActions: [
        'Defer non-essential capital expenditure',
        'Accelerate rent collection',
        'Review upcoming large payments',
        'Consider line of credit facility',
      ],
      relatedMetrics: ['cash_balance', 'inflows', 'outflows'],
    })
  }

  // Maintenance recommendations
  if (context.maintenanceIssues > 0) {
    recommendations.push({
      id: 'rec-maintenance',
      title: 'Resolve Maintenance Issues',
      description: `${context.maintenanceIssues} active maintenance issue(s) requiring attention.`,
      priority: 'MEDIUM',
      category: 'Maintenance',
      estimatedImpact: context.maintenanceIssues * 500, // Estimated cost
      confidence: 0.8,
      reasoning: [
        'Unresolved maintenance affects tenant satisfaction',
        'Can lead to larger issues if delayed',
        'Revenue impact from out-of-service units',
      ],
      suggestedActions: [
        'Prioritise by severity and revenue impact',
        'Schedule contractors for this week',
        'Communicate timelines to affected tenants',
        'Consider temporary alternatives',
      ],
      relatedMetrics: ['maintenance', 'unit_status', 'tenant_satisfaction'],
    })
  }

  // Sort by estimated impact (highest first)
  return recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact)
}

/**
 * Convert anomaly to recommendation
 */
export function anomalyToRecommendation(anomaly: Anomaly): AIRecommendation {
  return {
    id: `rec-${anomaly.id}`,
    title: `Investigate: ${anomaly.message}`,
    description: anomaly.recommendation,
    priority: anomaly.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
    category: anomaly.category,
    estimatedImpact: Math.abs(anomaly.deviation) * anomaly.expectedValue * 0.01,
    confidence: anomaly.confidence,
    reasoning: [
      `Current: ${anomaly.currentValue.toFixed(2)}`,
      `Expected: ${anomaly.expectedValue.toFixed(2)}`,
      `Deviation: ${anomaly.deviation.toFixed(1)}%`,
    ],
    suggestedActions: [anomaly.recommendation],
    relatedMetrics: [anomaly.metric],
  }
}

/**
 * Impact calculation helpers
 */
function calculateOccupancyImpact(currentOcc: number, adr: number, targetOcc: number): number {
  const roomCount = 24 // Assumed hotel rooms
  const daysPerMonth = 30
  const additionalOccupancy = targetOcc - currentOcc
  return additionalOccupancy * roomCount * daysPerMonth * adr
}

function calculateRateOptimisationImpact(currentADR: number, increasePercent: number): number {
  const roomCount = 24
  const daysPerMonth = 30
  const occupancy = 0.8 // Assumed
  return currentADR * increasePercent * roomCount * daysPerMonth * occupancy
}

function calculateMarginImpact(sales: number, currentMargin: number, targetMargin: number): number {
  const monthlyMultiplier = 4 // Weekly to monthly
  return sales * monthlyMultiplier * ((targetMargin - currentMargin) / 100)
}

function estimateVoidLoss(vacantUnits: number, avgRent: number): number {
  const weeksToLet = 3 // Average
  return vacantUnits * avgRent * (weeksToLet / 4)
}

