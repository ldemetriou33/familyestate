'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Building2, 
  Landmark,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  Calculator,
  PiggyBank,
  Target,
  Globe,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP } from '@/lib/utils'

// Mock market data - in production this would come from an API
const SONIA_RATE = 5.20 // Current Bank of England base rate
const MARKET_SPREAD = 1.5 // Typical spread for property mortgages

interface PropertyFinancials {
  id: string
  name: string
  type: 'HOTEL' | 'CAFE' | 'RESIDENTIAL'
  currentValue: number
  mortgageBalance: number
  mortgageRate: number
  termEndDate: Date
  penaltyFreeDate: Date
  mortgageLender: string
  mortgageType: 'FIXED' | 'VARIABLE' | 'TRACKER'
  monthlyPayment: number
  rentalYield: number
  annualRevenue: number
  annualExpenses: number
}

// Mock property data
const propertyFinancials: PropertyFinancials[] = [
  {
    id: '1',
    name: 'The Grand Hotel',
    type: 'HOTEL',
    currentValue: 2500000,
    mortgageBalance: 1200000,
    mortgageRate: 6.5,
    termEndDate: new Date('2025-06-15'),
    penaltyFreeDate: new Date('2025-03-15'),
    mortgageLender: 'NatWest',
    mortgageType: 'FIXED',
    monthlyPayment: 8500,
    rentalYield: 8.5,
    annualRevenue: 450000,
    annualExpenses: 280000,
  },
  {
    id: '2',
    name: 'Victoria Apartments',
    type: 'RESIDENTIAL',
    currentValue: 1800000,
    mortgageBalance: 950000,
    mortgageRate: 5.8,
    termEndDate: new Date('2024-09-20'),
    penaltyFreeDate: new Date('2024-06-20'),
    mortgageLender: 'Barclays',
    mortgageType: 'FIXED',
    monthlyPayment: 5800,
    rentalYield: 6.2,
    annualRevenue: 156000,
    annualExpenses: 45000,
  },
]

// Mock portfolio metrics
const portfolioMetrics = {
  totalValue: 4800000,
  totalDebt: 2150000,
  ltv: 44.8,
  cashReserves: 125000,
  monthlyNetIncome: 28500,
  dscr: 1.68,
  occupancyLast3Months: [85, 88, 91],
  cafeNetMargin: 22,
}

interface Recommendation {
  id: string
  type: 'refinance' | 'expand' | 'buy' | 'franchise' | 'optimize'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  savings?: number
  roi?: number
  deadline?: Date
  action: string
  confidence: number
}

function analyzePortfolio(): Recommendation[] {
  const recommendations: Recommendation[] = []
  const marketRate = SONIA_RATE + MARKET_SPREAD

  // Refinance Analysis
  propertyFinancials.forEach(property => {
    const rateDiff = property.mortgageRate - marketRate
    const monthlyPaymentSavings = (rateDiff / 100) * property.mortgageBalance / 12
    const penaltyFreeIn = Math.ceil((property.penaltyFreeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    if (rateDiff > 0.5 && penaltyFreeIn < 120) {
      recommendations.push({
        id: `refinance-${property.id}`,
        type: 'refinance',
        priority: monthlyPaymentSavings > 500 ? 'high' : 'medium',
        title: `Refinance ${property.name}`,
        description: `Current rate (${property.mortgageRate}%) is ${rateDiff.toFixed(2)}% above market. Penalty-free window opens in ${penaltyFreeIn} days.`,
        impact: `Save ${formatGBP(monthlyPaymentSavings)}/month (${formatGBP(monthlyPaymentSavings * 12)}/year)`,
        savings: monthlyPaymentSavings * 12,
        deadline: property.penaltyFreeDate,
        action: 'Request broker quotes',
        confidence: 85,
      })
    }
  })

  // Expansion Analysis - High occupancy scenario
  const avgOccupancy = portfolioMetrics.occupancyLast3Months.reduce((a, b) => a + b, 0) / 3
  if (avgOccupancy > 85 && portfolioMetrics.cashReserves > 100000) {
    recommendations.push({
      id: 'expand-rooms',
      type: 'expand',
      priority: 'high',
      title: 'Initiate Room Expansion',
      description: `Occupancy averaging ${avgOccupancy.toFixed(0)}% for 3 months with ${formatGBP(portfolioMetrics.cashReserves)} in reserves. Demand exceeds supply.`,
      impact: 'Est. ROI: 12-15% annually on new room investment',
      roi: 12,
      action: 'Start planning permission process',
      confidence: 78,
    })
  }

  // Buy/Acquisition Analysis - Strong DSCR
  if (portfolioMetrics.dscr > 1.5) {
    const leverageCapacity = portfolioMetrics.totalValue * 0.6 - portfolioMetrics.totalDebt
    recommendations.push({
      id: 'buy-capacity',
      type: 'buy',
      priority: 'medium',
      title: 'Leverage Capacity Available',
      description: `DSCR of ${portfolioMetrics.dscr.toFixed(2)} indicates strong debt serviceability. Unused leverage: ${formatGBP(leverageCapacity)}.`,
      impact: `Can acquire assets up to ${formatGBP(leverageCapacity * 1.5)} with 60% LTV`,
      action: 'Review acquisition pipeline',
      confidence: 72,
    })
  }

  // Franchise Analysis - Strong cafe margins
  if (portfolioMetrics.cafeNetMargin > 20) {
    recommendations.push({
      id: 'franchise-ready',
      type: 'franchise',
      priority: 'medium',
      title: 'Franchise Model Ready',
      description: `Cafe net margin of ${portfolioMetrics.cafeNetMargin}% exceeds 20% threshold. Operations are scalable.`,
      impact: 'Export brand to new location with minimal capital',
      roi: 25,
      action: 'Document SOPs for franchising',
      confidence: 65,
    })
  }

  // Cash Optimization
  if (portfolioMetrics.cashReserves > 50000) {
    recommendations.push({
      id: 'optimize-cash',
      type: 'optimize',
      priority: 'low',
      title: 'Optimize Cash Reserves',
      description: `${formatGBP(portfolioMetrics.cashReserves)} in reserves. Consider higher-yield notice accounts.`,
      impact: '+0.8-1.2% APY vs current account',
      savings: portfolioMetrics.cashReserves * 0.01,
      action: 'Move to notice account',
      confidence: 95,
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

export function EmpireBrain() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null)

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setRecommendations(analyzePortfolio())
      setIsAnalyzing(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'refinance': return <Landmark className="w-5 h-5" />
      case 'expand': return <Building2 className="w-5 h-5" />
      case 'buy': return <Target className="w-5 h-5" />
      case 'franchise': return <Globe className="w-5 h-5" />
      case 'optimize': return <PiggyBank className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'refinance': return 'text-blue-500 bg-blue-500/10'
      case 'expand': return 'text-purple-500 bg-purple-500/10'
      case 'buy': return 'text-green-500 bg-green-500/10'
      case 'franchise': return 'text-amber-500 bg-amber-500/10'
      case 'optimize': return 'text-cyan-500 bg-cyan-500/10'
    }
  }

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/30'
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/30'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/30'
    }
  }

  const marketRate = SONIA_RATE + MARKET_SPREAD

  return (
    <Card className="bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-panel)] to-[var(--bg-tertiary)] border-[var(--accent)]/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[var(--accent)] to-purple-600 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="flex items-center gap-2">
                Empire Brain
                <Sparkles className="w-4 h-4 text-amber-400" />
              </span>
              <p className="text-xs text-[var(--text-muted)] font-normal">Strategic Capital Advisor</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsAnalyzing(true)
              setTimeout(() => {
                setRecommendations(analyzePortfolio())
                setIsAnalyzing(false)
              }, 1500)
            }}
            className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-[var(--text-muted)] ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Context */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-[var(--bg-primary)]/50 rounded-lg">
            <p className="text-xs text-[var(--text-muted)]">SONIA Rate</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{SONIA_RATE}%</p>
          </div>
          <div className="p-3 bg-[var(--bg-primary)]/50 rounded-lg">
            <p className="text-xs text-[var(--text-muted)]">Market Rate</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{marketRate.toFixed(2)}%</p>
          </div>
          <div className="p-3 bg-[var(--bg-primary)]/50 rounded-lg">
            <p className="text-xs text-[var(--text-muted)]">Portfolio LTV</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{portfolioMetrics.ltv}%</p>
          </div>
          <div className="p-3 bg-[var(--bg-primary)]/50 rounded-lg">
            <p className="text-xs text-[var(--text-muted)]">DSCR</p>
            <p className={`text-lg font-bold ${portfolioMetrics.dscr > 1.25 ? 'text-green-500' : 'text-amber-500'}`}>
              {portfolioMetrics.dscr.toFixed(2)}x
            </p>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="p-4 bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 rounded-xl border border-[var(--accent)]/30">
          <p className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--accent)]" />
            What is the best move for your capital right now?
          </p>
        </div>

        {/* Recommendations */}
        {isAnalyzing ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-[var(--accent)] mx-auto mb-4 animate-pulse" />
            <p className="text-[var(--text-muted)]">Analyzing portfolio data...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-[var(--accent)] ${
                  selectedRec?.id === rec.id ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border-primary)]'
                }`}
                onClick={() => setSelectedRec(selectedRec?.id === rec.id ? null : rec)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
                      {getTypeIcon(rec.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{rec.title}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded border ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{rec.confidence}% confident</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedRec?.id === rec.id && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-primary)] space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-[var(--bg-primary)] rounded-lg">
                        <p className="text-xs text-[var(--text-muted)]">Impact</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{rec.impact}</p>
                      </div>
                      {rec.savings && (
                        <div className="p-3 bg-[var(--bg-primary)] rounded-lg">
                          <p className="text-xs text-[var(--text-muted)]">Annual Savings</p>
                          <p className="text-sm font-bold text-green-500">{formatGBP(rec.savings)}</p>
                        </div>
                      )}
                      {rec.roi && (
                        <div className="p-3 bg-[var(--bg-primary)] rounded-lg">
                          <p className="text-xs text-[var(--text-muted)]">Est. ROI</p>
                          <p className="text-sm font-bold text-[var(--accent)]">{rec.roi}%</p>
                        </div>
                      )}
                      {rec.deadline && (
                        <div className="p-3 bg-[var(--bg-primary)] rounded-lg">
                          <p className="text-xs text-[var(--text-muted)]">Action Window</p>
                          <p className="text-sm font-medium text-amber-500">
                            {rec.deadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button className="w-full py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      {rec.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EmpireBrain

