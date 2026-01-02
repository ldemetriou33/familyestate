'use client'

import { X, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Activity, Target } from 'lucide-react'
import { Anomaly } from '@/lib/ai/anomaly-detection'
import { formatGBP, formatUKDate, formatPercentage } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface AnomalyDetailModalProps {
  anomaly: Anomaly
  onClose: () => void
  onCreateAction?: () => void
}

export function AnomalyDetailModal({ anomaly, onClose, onCreateAction }: AnomalyDetailModalProps) {
  const severityConfig = {
    CRITICAL: { color: 'text-bloomberg-danger', bg: 'bg-bloomberg-danger/10', border: 'border-bloomberg-danger/30' },
    WARNING: { color: 'text-bloomberg-warning', bg: 'bg-bloomberg-warning/10', border: 'border-bloomberg-warning/30' },
    INFO: { color: 'text-bloomberg-accent', bg: 'bg-bloomberg-accent/10', border: 'border-bloomberg-accent/30' },
  }

  const config = severityConfig[anomaly.severity]
  const isPositive = anomaly.deviation > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bloomberg-panel border border-bloomberg-border rounded-lg m-4 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-bloomberg-panel border-b border-bloomberg-border p-6 flex items-start justify-between z-10">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${config.bg}`}>
              <AlertTriangle className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.color} font-semibold`}>
                  {anomaly.severity}
                </span>
                <span className="text-xs text-bloomberg-textMuted">{anomaly.category}</span>
              </div>
              <h2 className="text-xl font-bold text-bloomberg-text">{anomaly.message}</h2>
              <p className="text-sm text-bloomberg-textMuted mt-1">
                Detected at {formatUKDate(anomaly.detectedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-bloomberg-textMuted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className={`${config.bg} border ${config.border}`}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-bloomberg-textMuted mb-1">Current Value</p>
                <p className="text-2xl font-bold text-bloomberg-text">
                  {anomaly.metric.includes('occupancy') 
                    ? formatPercentage(anomaly.currentValue * 100)
                    : formatGBP(anomaly.currentValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-bloomberg-textMuted mb-1">Expected Value</p>
                <p className="text-2xl font-bold text-bloomberg-text">
                  {anomaly.metric.includes('occupancy')
                    ? formatPercentage(anomaly.expectedValue * 100)
                    : formatGBP(anomaly.expectedValue)}
                </p>
              </CardContent>
            </Card>

            <Card className={isPositive ? 'bg-bloomberg-success/10 border-bloomberg-success/30' : 'bg-bloomberg-danger/10 border-bloomberg-danger/30'}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-bloomberg-textMuted mb-1">Deviation</p>
                <div className={`flex items-center justify-center gap-1 text-2xl font-bold ${
                  isPositive ? 'text-bloomberg-success' : 'text-bloomberg-danger'
                }`}>
                  {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {isPositive ? '+' : ''}{anomaly.deviation.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Gauge */}
          <div className="p-4 bg-bloomberg-darker rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-bloomberg-accent" />
              <span className="text-sm font-semibold text-bloomberg-text">Deviation Analysis</span>
            </div>
            <div className="relative h-8 bg-bloomberg-panel rounded-full overflow-hidden">
              {/* Normal range indicator */}
              <div className="absolute left-1/4 right-1/4 top-0 bottom-0 bg-bloomberg-success/20" />
              
              {/* Current position marker */}
              <div 
                className={`absolute top-0 bottom-0 w-1 ${
                  Math.abs(anomaly.deviation) > 30 ? 'bg-bloomberg-danger' : 
                  Math.abs(anomaly.deviation) > 15 ? 'bg-bloomberg-warning' : 'bg-bloomberg-success'
                }`}
                style={{
                  left: `${Math.min(95, Math.max(5, 50 + anomaly.deviation))}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-bloomberg-textMuted">
              <span>-50%</span>
              <span>Normal Range</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="p-4 bg-bloomberg-darker rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-bloomberg-accent" />
                <span className="text-sm font-semibold text-bloomberg-text">Detection Confidence</span>
              </div>
              <span className="text-lg font-bold text-bloomberg-accent">
                {(anomaly.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-bloomberg-panel rounded-full overflow-hidden">
              <div 
                className="h-full bg-bloomberg-accent rounded-full transition-all"
                style={{ width: `${anomaly.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
            <div className="flex items-start gap-3">
              <Lightbulb className={`w-5 h-5 mt-0.5 ${config.color}`} />
              <div>
                <h3 className="font-semibold text-bloomberg-text mb-1">Recommended Action</h3>
                <p className="text-sm text-bloomberg-textMuted">{anomaly.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-bloomberg-border">
            <button
              onClick={onCreateAction}
              className="flex-1 px-4 py-3 bg-bloomberg-accent hover:bg-bloomberg-accentHover text-white rounded-lg font-semibold transition-colors"
            >
              Create Action Item
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-bloomberg-darker hover:bg-bloomberg-panel text-bloomberg-text rounded-lg font-semibold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

