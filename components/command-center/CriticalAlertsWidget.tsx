'use client'

import { AlertTriangle, AlertCircle, Info, X, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertSeverity } from '@/lib/types/abbey-os'

interface CriticalAlertsWidgetProps {
  alerts: Alert[]
  onDismiss?: (alertId: string) => void
}

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  CRITICAL: { icon: AlertTriangle, color: 'text-bloomberg-danger', bg: 'bg-bloomberg-danger/10 border-bloomberg-danger/30' },
  WARNING: { icon: AlertCircle, color: 'text-bloomberg-warning', bg: 'bg-bloomberg-warning/10 border-bloomberg-warning/30' },
  INFO: { icon: Info, color: 'text-bloomberg-accent', bg: 'bg-bloomberg-accent/10 border-bloomberg-accent/30' },
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

export function CriticalAlertsWidget({ alerts, onDismiss }: CriticalAlertsWidgetProps) {
  const activeAlerts = alerts.filter(a => !a.isDismissed)
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length
  const warningCount = activeAlerts.filter(a => a.severity === 'WARNING').length

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-bloomberg-danger" />
            Critical Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-bloomberg-danger/20 text-bloomberg-danger rounded-full">
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-bloomberg-warning/20 text-bloomberg-warning rounded-full">
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-bloomberg-textMuted">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${config.bg} transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-bloomberg-text">
                        {alert.title}
                      </p>
                      {onDismiss && (
                        <button
                          onClick={() => onDismiss(alert.id)}
                          className="p-1 hover:bg-bloomberg-darker rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-bloomberg-textMuted" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-bloomberg-textMuted mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-bloomberg-textMuted">
                        {formatTimeAgo(new Date(alert.createdAt))}
                      </span>
                      <button className="flex items-center gap-1 text-xs text-bloomberg-accent hover:underline">
                        View Details <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

