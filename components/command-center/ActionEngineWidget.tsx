'use client'

import { Target, Clock, PoundSterling, CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP, formatUKDate } from '@/lib/utils'
import { ActionItem, Priority } from '@/lib/types/abbey-os'

interface ActionEngineWidgetProps {
  actions: ActionItem[]
  onComplete?: (actionId: string) => void
}

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  HIGH: { color: 'text-bloomberg-danger', bg: 'bg-bloomberg-danger/10', label: 'HIGH' },
  MEDIUM: { color: 'text-bloomberg-warning', bg: 'bg-bloomberg-warning/10', label: 'MED' },
  LOW: { color: 'text-bloomberg-textMuted', bg: 'bg-bloomberg-panel', label: 'LOW' },
}

export function ActionEngineWidget({ actions, onComplete }: ActionEngineWidgetProps) {
  // Sort by estimated impact (highest first), then by urgency score
  const sortedActions = [...actions]
    .filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
    .sort((a, b) => {
      const impactA = a.estimatedImpactGbp || 0
      const impactB = b.estimatedImpactGbp || 0
      if (impactB !== impactA) return impactB - impactA
      return (b.urgencyScore || 0) - (a.urgencyScore || 0)
    })
    .slice(0, 5)

  const totalImpact = sortedActions.reduce((sum, a) => sum + (a.estimatedImpactGbp || 0), 0)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-bloomberg-accent" />
            Action Engine
          </CardTitle>
          <div className="flex items-center gap-1 px-2 py-1 bg-bloomberg-success/10 rounded">
            <PoundSterling className="w-3 h-3 text-bloomberg-success" />
            <span className="text-xs font-semibold text-bloomberg-success">
              {formatGBP(totalImpact)} impact
            </span>
          </div>
        </div>
        <p className="text-xs text-bloomberg-textMuted mt-1">Today's Top 5 Actions (by £ impact)</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedActions.map((action, index) => {
          const config = priorityConfig[action.priority]
          const isOverdue = action.dueDate && new Date(action.dueDate) < new Date()

          return (
            <div
              key={action.id}
              className={`p-3 rounded-lg border border-bloomberg-border bg-bloomberg-darker hover:bg-bloomberg-panel transition-all cursor-pointer group`}
            >
              <div className="flex items-start gap-3">
                {/* Rank Number */}
                <div className="w-6 h-6 rounded-full bg-bloomberg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-bloomberg-accent">#{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    {action.category && (
                      <span className="text-xs text-bloomberg-textMuted">
                        {action.category}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-bloomberg-text mb-1">
                    {action.title}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {action.estimatedImpactGbp && (
                        <div className="flex items-center gap-1">
                          <PoundSterling className="w-3 h-3 text-bloomberg-success" />
                          <span className="text-xs font-semibold text-bloomberg-success">
                            {formatGBP(action.estimatedImpactGbp)}
                          </span>
                        </div>
                      )}
                      {action.dueDate && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-bloomberg-danger' : 'text-bloomberg-textMuted'}`}>
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {isOverdue ? 'Overdue' : formatUKDate(new Date(action.dueDate))}
                          </span>
                        </div>
                      )}
                    </div>

                    {onComplete && (
                      <button
                        onClick={() => onComplete(action.id)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-bloomberg-accent hover:underline transition-opacity"
                      >
                        Complete <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* View All Link */}
        <button className="w-full py-2 text-sm text-bloomberg-accent hover:underline flex items-center justify-center gap-1">
          View All Actions <ArrowRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  )
}

