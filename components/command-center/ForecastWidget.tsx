'use client'

import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP } from '@/lib/utils'
import { Forecast } from '@/lib/types/abbey-os'

interface ForecastWidgetProps {
  forecasts: Forecast[]
}

export function ForecastWidget({ forecasts }: ForecastWidgetProps) {
  // Get next 30 days
  const next30Days = forecasts.slice(0, 30)
  
  // Calculate totals
  const totalRevenue = next30Days.reduce((sum, f) => sum + (f.predictedRevenue || 0), 0)
  const avgOccupancy = next30Days.reduce((sum, f) => sum + (f.predictedOccupancy || 0), 0) / next30Days.length
  const avgCovers = next30Days.reduce((sum, f) => sum + (f.predictedCovers || 0), 0) / next30Days.length
  const avgConfidence = next30Days.reduce((sum, f) => sum + (f.confidenceLevel || 0), 0) / next30Days.length

  // Weekly breakdown
  const weeklyData = []
  for (let i = 0; i < 4; i++) {
    const weekForecasts = next30Days.slice(i * 7, (i + 1) * 7)
    const weekRevenue = weekForecasts.reduce((sum, f) => sum + (f.predictedRevenue || 0), 0)
    weeklyData.push({
      week: `Week ${i + 1}`,
      revenue: weekRevenue,
    })
  }

  const maxWeeklyRevenue = Math.max(...weeklyData.map(w => w.revenue))

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5 text-bloomberg-accent" />
          30-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Projected Revenue */}
        <div className="p-4 bg-gradient-to-br from-bloomberg-accent/10 to-bloomberg-accent/5 rounded-lg border border-bloomberg-accent/20">
          <p className="text-xs text-bloomberg-textMuted mb-1">Projected Revenue</p>
          <p className="text-3xl font-bold text-bloomberg-text">{formatGBP(totalRevenue)}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-bloomberg-textMuted">Confidence:</span>
            <span className="text-xs font-semibold text-bloomberg-success">
              {(avgConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-bloomberg-darker rounded-lg">
            <p className="text-xs text-bloomberg-textMuted mb-1">Avg. Occupancy</p>
            <p className="text-xl font-semibold text-bloomberg-text">
              {(avgOccupancy * 100).toFixed(0)}%
            </p>
          </div>
          <div className="p-3 bg-bloomberg-darker rounded-lg">
            <p className="text-xs text-bloomberg-textMuted mb-1">Avg. Daily Covers</p>
            <p className="text-xl font-semibold text-bloomberg-text">
              {avgCovers.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Weekly Breakdown Chart */}
        <div className="pt-3 border-t border-bloomberg-border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-bloomberg-textMuted" />
            <span className="text-xs text-bloomberg-textMuted">Weekly Revenue Projection</span>
          </div>
          <div className="space-y-2">
            {weeklyData.map((week, index) => (
              <div key={week.week} className="flex items-center gap-3">
                <span className="text-xs text-bloomberg-textMuted w-14">{week.week}</span>
                <div className="flex-1 h-4 bg-bloomberg-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-bloomberg-accent to-blue-500 rounded-full transition-all"
                    style={{ width: `${(week.revenue / maxWeeklyRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-bloomberg-text w-16 text-right">
                  {formatGBP(week.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

