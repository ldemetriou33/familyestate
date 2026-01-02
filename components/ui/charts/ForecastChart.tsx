'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Calendar, Target } from 'lucide-react'
import { formatGBP, formatUKDate } from '@/lib/utils'
import { ForecastResult, OccupancyForecast } from '@/lib/ai/forecasting'

interface ForecastChartProps {
  title: string
  data: ForecastResult[] | OccupancyForecast[]
  type: 'revenue' | 'occupancy' | 'cashflow'
  showConfidence?: boolean
}

export function ForecastChart({ title, data, type, showConfidence = true }: ForecastChartProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '14d' | '30d'>('14d')

  const periodDays = { '7d': 7, '14d': 14, '30d': 30 }
  const displayData = data.slice(0, periodDays[selectedPeriod])

  // Calculate chart dimensions
  const maxValue = Math.max(...displayData.map(d => d.upperBound || d.predictedValue))
  const minValue = Math.min(...displayData.map(d => d.lowerBound || d.predictedValue))
  const range = maxValue - minValue || 1

  // Format value based on type
  const formatValue = (value: number) => {
    if (type === 'occupancy') return `${(value * 100).toFixed(0)}%`
    return formatGBP(value)
  }

  // Calculate trend
  const firstWeek = displayData.slice(0, 7).reduce((sum, d) => sum + d.predictedValue, 0) / 7
  const lastWeek = displayData.slice(-7).reduce((sum, d) => sum + d.predictedValue, 0) / 7
  const trendPercent = ((lastWeek - firstWeek) / firstWeek) * 100
  const isPositiveTrend = trendPercent >= 0

  // Average confidence
  const avgConfidence = displayData.reduce((sum, d) => sum + d.confidence, 0) / displayData.length

  return (
    <div className="bg-bloomberg-darker rounded-lg border border-bloomberg-border overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-bloomberg-panel transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-bloomberg-accent" />
          <div>
            <h3 className="font-semibold text-bloomberg-text">{title}</h3>
            <p className="text-xs text-bloomberg-textMuted">
              {periodDays[selectedPeriod]}-day forecast
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`flex items-center gap-1 ${isPositiveTrend ? 'text-bloomberg-success' : 'text-bloomberg-danger'}`}>
              {isPositiveTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">{isPositiveTrend ? '+' : ''}{trendPercent.toFixed(1)}%</span>
            </div>
            {showConfidence && (
              <p className="text-xs text-bloomberg-textMuted">
                {(avgConfidence * 100).toFixed(0)}% confidence
              </p>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-bloomberg-textMuted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-bloomberg-textMuted" />
          )}
        </div>
      </div>

      {/* Chart Area */}
      {expanded && (
        <div className="p-4 border-t border-bloomberg-border">
          {/* Period Selector */}
          <div className="flex gap-2 mb-4">
            {(['7d', '14d', '30d'] as const).map(period => (
              <button
                key={period}
                onClick={(e) => { e.stopPropagation(); setSelectedPeriod(period) }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedPeriod === period
                    ? 'bg-bloomberg-accent text-white'
                    : 'bg-bloomberg-panel text-bloomberg-textMuted hover:text-bloomberg-text'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="relative h-48">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-bloomberg-textMuted">
              <span>{formatValue(maxValue)}</span>
              <span>{formatValue((maxValue + minValue) / 2)}</span>
              <span>{formatValue(minValue)}</span>
            </div>

            {/* Chart area */}
            <div className="ml-16 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2].map(i => (
                  <div key={i} className="border-t border-bloomberg-border/30" />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-px">
                {displayData.map((point, index) => {
                  const height = ((point.predictedValue - minValue) / range) * 100
                  const confidenceOpacity = 0.3 + point.confidence * 0.7

                  return (
                    <div
                      key={index}
                      className="flex-1 relative group"
                      style={{ height: '100%' }}
                    >
                      {/* Confidence band */}
                      {showConfidence && point.upperBound && point.lowerBound && (
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-bloomberg-accent/20 rounded-t"
                          style={{
                            height: `${((point.upperBound - point.lowerBound) / range) * 100}%`,
                            bottom: `${((point.lowerBound - minValue) / range) * 100}%`,
                          }}
                        />
                      )}

                      {/* Main bar */}
                      <div
                        className="absolute bottom-0 left-1 right-1 bg-bloomberg-accent rounded-t transition-all group-hover:bg-bloomberg-accentHover"
                        style={{ 
                          height: `${height}%`,
                          opacity: confidenceOpacity,
                        }}
                      />

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-bloomberg-panel border border-bloomberg-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                          <p className="text-xs text-bloomberg-textMuted">
                            {formatUKDate(point.date)}
                          </p>
                          <p className="text-sm font-semibold text-bloomberg-text">
                            {formatValue(point.predictedValue)}
                          </p>
                          <p className="text-xs text-bloomberg-textMuted">
                            {(point.confidence * 100).toFixed(0)}% confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-bloomberg-border">
            <div className="text-center">
              <p className="text-xs text-bloomberg-textMuted">Average</p>
              <p className="text-sm font-semibold text-bloomberg-text">
                {formatValue(displayData.reduce((sum, d) => sum + d.predictedValue, 0) / displayData.length)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-bloomberg-textMuted">Peak</p>
              <p className="text-sm font-semibold text-bloomberg-success">
                {formatValue(Math.max(...displayData.map(d => d.predictedValue)))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-bloomberg-textMuted">Low</p>
              <p className="text-sm font-semibold text-bloomberg-warning">
                {formatValue(Math.min(...displayData.map(d => d.predictedValue)))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

