'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  ChevronRight,
  Activity,
  Target
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP } from '@/lib/utils'
import { generateAIInsights, AIInsights, BusinessContext } from '@/lib/ai'

interface AIInsightsWidgetProps {
  context: BusinessContext
}

export function AIInsightsWidget({ context }: AIInsightsWidgetProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI processing
    setIsLoading(true)
    const timer = setTimeout(() => {
      const aiInsights = generateAIInsights(context)
      setInsights(aiInsights)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [context])

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-bloomberg-accent animate-pulse" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-bloomberg-accent mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-bloomberg-textMuted">Analysing portfolio data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) return null

  const healthColor = insights.healthScore >= 80 
    ? 'text-bloomberg-success' 
    : insights.healthScore >= 60 
    ? 'text-bloomberg-warning' 
    : 'text-bloomberg-danger'

  const healthBg = insights.healthScore >= 80 
    ? 'bg-bloomberg-success' 
    : insights.healthScore >= 60 
    ? 'bg-bloomberg-warning' 
    : 'bg-bloomberg-danger'

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-bloomberg-accent" />
            AI Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-bloomberg-accent" />
            <span className="text-xs text-bloomberg-textMuted">Live Analysis</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="p-4 bg-bloomberg-darker rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-bloomberg-textMuted">Portfolio Health Score</span>
            <span className={`text-2xl font-bold ${healthColor}`}>
              {insights.healthScore}/100
            </span>
          </div>
          <div className="h-2 bg-bloomberg-panel rounded-full overflow-hidden">
            <div 
              className={`h-full ${healthBg} transition-all duration-500`}
              style={{ width: `${insights.healthScore}%` }}
            />
          </div>
          <p className="text-xs text-bloomberg-textMuted mt-2">
            {insights.summary}
          </p>
        </div>

        {/* Top Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-bloomberg-warning" />
            <span className="text-sm font-semibold text-bloomberg-text">AI Recommendations</span>
          </div>
          <div className="space-y-2">
            {insights.recommendations.slice(0, 3).map((rec, index) => (
              <div 
                key={rec.id}
                className="p-3 bg-bloomberg-darker rounded-lg hover:bg-bloomberg-panel transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        rec.priority === 'HIGH' 
                          ? 'bg-bloomberg-danger/10 text-bloomberg-danger'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-bloomberg-warning/10 text-bloomberg-warning'
                          : 'bg-bloomberg-textMuted/10 text-bloomberg-textMuted'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-xs text-bloomberg-textMuted">{rec.category}</span>
                    </div>
                    <p className="text-sm font-medium text-bloomberg-text">{rec.title}</p>
                    <p className="text-xs text-bloomberg-textMuted mt-1 line-clamp-1">
                      {rec.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-bloomberg-success">
                      {formatGBP(rec.estimatedImpact)}
                    </p>
                    <p className="text-xs text-bloomberg-textMuted">
                      {(rec.confidence * 100).toFixed(0)}% conf.
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-bloomberg-textMuted opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies Detected */}
        {insights.anomalies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-bloomberg-danger" />
              <span className="text-sm font-semibold text-bloomberg-text">
                Anomalies Detected ({insights.anomalies.length})
              </span>
            </div>
            <div className="space-y-2">
              {insights.anomalies.slice(0, 2).map((anomaly, index) => (
                <div 
                  key={anomaly.id}
                  className={`p-3 rounded-lg border ${
                    anomaly.severity === 'CRITICAL'
                      ? 'bg-bloomberg-danger/10 border-bloomberg-danger/30'
                      : 'bg-bloomberg-warning/10 border-bloomberg-warning/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {anomaly.deviation > 0 ? (
                      <TrendingUp className={`w-4 h-4 mt-0.5 ${
                        anomaly.severity === 'CRITICAL' ? 'text-bloomberg-danger' : 'text-bloomberg-warning'
                      }`} />
                    ) : (
                      <TrendingDown className={`w-4 h-4 mt-0.5 ${
                        anomaly.severity === 'CRITICAL' ? 'text-bloomberg-danger' : 'text-bloomberg-warning'
                      }`} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-bloomberg-text">{anomaly.message}</p>
                      <p className="text-xs text-bloomberg-textMuted mt-1">{anomaly.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 30-Day Forecast Summary */}
        <div className="pt-3 border-t border-bloomberg-border">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-bloomberg-accent" />
            <span className="text-sm font-semibold text-bloomberg-text">30-Day Forecast</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-bloomberg-darker rounded-lg">
              <p className="text-xs text-bloomberg-textMuted">Avg Occupancy</p>
              <p className="text-lg font-bold text-bloomberg-text">
                {(insights.forecasts.occupancy.reduce((sum, f) => sum + f.predictedOccupancy, 0) / 
                  insights.forecasts.occupancy.length * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center p-2 bg-bloomberg-darker rounded-lg">
              <p className="text-xs text-bloomberg-textMuted">Cafe Revenue</p>
              <p className="text-lg font-bold text-bloomberg-text">
                £{Math.round(insights.forecasts.cafe.reduce((sum, f) => sum + f.predictedValue, 0) / 1000)}K
              </p>
            </div>
            <div className="text-center p-2 bg-bloomberg-darker rounded-lg">
              <p className="text-xs text-bloomberg-textMuted">Cash (90d)</p>
              <p className="text-lg font-bold text-bloomberg-success">
                £{Math.round(insights.forecasts.cashflow[insights.forecasts.cashflow.length - 1]?.predictedValue / 1000)}K
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

