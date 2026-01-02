'use client'

import { useState } from 'react'
import { 
  Circle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Database,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

export type DataSource = 
  | 'MANUAL'
  | 'XERO'
  | 'STRIPE'
  | 'PMS_OPERA'
  | 'PMS_CLOUDBEDS'
  | 'POS_SQUARE'
  | 'POS_LIGHTSPEED'
  | 'BANK_FEED'
  | 'API_IMPORT'
  | 'CSV_UPLOAD'
  | 'SYSTEM_GENERATED'

export type DataConfidence = 
  | 'VERIFIED'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNKNOWN'

export type ReconciliationStatus = 
  | 'PENDING'
  | 'MATCHED'
  | 'UNMATCHED'
  | 'FLAGGED'
  | 'FORCE_MATCHED'
  | 'EXCLUDED'

export interface DataHealthProps {
  /** When the data was last updated */
  lastUpdated: Date | string
  /** Source of the data */
  source: DataSource
  /** Confidence level */
  confidence?: DataConfidence
  /** Reconciliation status (optional) */
  reconciliationStatus?: ReconciliationStatus
  /** Show compact version (just the dot) */
  compact?: boolean
  /** Show in a badge style */
  badge?: boolean
  /** Additional CSS classes */
  className?: string
  /** Callback when refresh is clicked */
  onRefresh?: () => void
  /** Is currently refreshing */
  isRefreshing?: boolean
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getSourceLabel = (source: DataSource): string => {
  const labels: Record<DataSource, string> = {
    MANUAL: 'Manual Entry',
    XERO: 'Xero API',
    STRIPE: 'Stripe',
    PMS_OPERA: 'Opera PMS',
    PMS_CLOUDBEDS: 'Cloudbeds',
    POS_SQUARE: 'Square POS',
    POS_LIGHTSPEED: 'Lightspeed',
    BANK_FEED: 'Bank Feed',
    API_IMPORT: 'API Import',
    CSV_UPLOAD: 'CSV Upload',
    SYSTEM_GENERATED: 'System Generated',
  }
  return labels[source] || source
}

const getConfidenceLabel = (confidence: DataConfidence): string => {
  const labels: Record<DataConfidence, string> = {
    VERIFIED: 'Verified',
    HIGH: 'High Confidence',
    MEDIUM: 'Medium Confidence',
    LOW: 'Low Confidence',
    UNKNOWN: 'Unknown',
  }
  return labels[confidence] || confidence
}

const getReconciliationLabel = (status: ReconciliationStatus): string => {
  const labels: Record<ReconciliationStatus, string> = {
    PENDING: 'Pending Reconciliation',
    MATCHED: 'Reconciled',
    UNMATCHED: 'Unmatched',
    FLAGGED: 'Flagged for Review',
    FORCE_MATCHED: 'Force Matched',
    EXCLUDED: 'Excluded',
  }
  return labels[status] || status
}

type FreshnessLevel = 'live' | 'recent' | 'stale' | 'critical'

const getFreshness = (lastUpdated: Date | string): { level: FreshnessLevel; label: string } => {
  const now = new Date()
  const updated = new Date(lastUpdated)
  const diffMs = now.getTime() - updated.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffHours < 1) {
    return { level: 'live', label: 'Live' }
  } else if (diffDays <= 1) {
    return { level: 'live', label: 'Today' }
  } else if (diffDays <= 3) {
    return { level: 'recent', label: `${Math.floor(diffDays)}d ago` }
  } else if (diffDays <= 7) {
    return { level: 'stale', label: `${Math.floor(diffDays)}d ago` }
  } else {
    return { level: 'critical', label: `${Math.floor(diffDays)}d ago` }
  }
}

const getFreshnessColor = (level: FreshnessLevel): string => {
  switch (level) {
    case 'live':
      return 'text-green-400'
    case 'recent':
      return 'text-amber-400'
    case 'stale':
      return 'text-orange-500'
    case 'critical':
      return 'text-red-500'
  }
}

const getFreshnessBgColor = (level: FreshnessLevel): string => {
  switch (level) {
    case 'live':
      return 'bg-green-500/20'
    case 'recent':
      return 'bg-amber-500/20'
    case 'stale':
      return 'bg-orange-500/20'
    case 'critical':
      return 'bg-red-500/20'
  }
}

const getReconciliationColor = (status: ReconciliationStatus): string => {
  switch (status) {
    case 'MATCHED':
      return 'text-green-400'
    case 'PENDING':
      return 'text-amber-400'
    case 'UNMATCHED':
    case 'FLAGGED':
      return 'text-red-500'
    case 'FORCE_MATCHED':
      return 'text-blue-400'
    case 'EXCLUDED':
      return 'text-gray-400'
  }
}

// ============================================
// COMPONENTS
// ============================================

/**
 * DataHealthIndicator - Reusable component for displaying data freshness and source
 * 
 * Usage:
 * ```tsx
 * <DataHealthIndicator 
 *   lastUpdated={new Date()}
 *   source="XERO"
 *   confidence="VERIFIED"
 * />
 * ```
 */
export function DataHealthIndicator({
  lastUpdated,
  source,
  confidence = 'MEDIUM',
  reconciliationStatus,
  compact = false,
  badge = false,
  className = '',
  onRefresh,
  isRefreshing = false,
}: DataHealthProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  const freshness = getFreshness(lastUpdated)
  const freshnessColor = getFreshnessColor(freshness.level)
  const freshnessBgColor = getFreshnessBgColor(freshness.level)

  // Compact mode: just the dot
  if (compact) {
    return (
      <div 
        className={`relative inline-flex items-center ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Circle 
          className={`w-2 h-2 fill-current ${freshnessColor}`} 
        />
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
            <div className="bg-bloomberg-darker border border-bloomberg-border rounded-lg shadow-xl p-3 min-w-[200px]">
              <TooltipContent 
                lastUpdated={lastUpdated}
                source={source}
                confidence={confidence}
                reconciliationStatus={reconciliationStatus}
                freshness={freshness}
              />
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-bloomberg-border" />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Badge mode: compact inline badge
  if (badge) {
    return (
      <div 
        className={`relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${freshnessBgColor} ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Circle className={`w-2 h-2 fill-current ${freshnessColor}`} />
        <span className={`text-xs font-medium ${freshnessColor}`}>
          {freshness.label}
        </span>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
            <div className="bg-bloomberg-darker border border-bloomberg-border rounded-lg shadow-xl p-3 min-w-[220px]">
              <TooltipContent 
                lastUpdated={lastUpdated}
                source={source}
                confidence={confidence}
                reconciliationStatus={reconciliationStatus}
                freshness={freshness}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full mode: expanded view
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="relative flex items-center gap-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Status indicator */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${freshnessBgColor}`}>
          {freshness.level === 'live' && (
            <div className="relative">
              <Circle className={`w-2 h-2 fill-current ${freshnessColor}`} />
              <Circle className={`w-2 h-2 fill-current ${freshnessColor} absolute top-0 left-0 animate-ping`} />
            </div>
          )}
          {freshness.level === 'recent' && (
            <Circle className={`w-2 h-2 fill-current ${freshnessColor}`} />
          )}
          {freshness.level === 'stale' && (
            <AlertTriangle className={`w-3 h-3 ${freshnessColor}`} />
          )}
          {freshness.level === 'critical' && (
            <XCircle className={`w-3 h-3 ${freshnessColor}`} />
          )}
          
          <span className={`text-xs font-medium ${freshnessColor}`}>
            {freshness.label}
          </span>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-bloomberg-panel text-xs text-bloomberg-textMuted">
          <Database className="w-3 h-3" />
          <span>{getSourceLabel(source)}</span>
          {confidence === 'VERIFIED' && (
            <CheckCircle className="w-3 h-3 text-green-400" />
          )}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-bloomberg-panel transition-colors text-bloomberg-textMuted hover:text-bloomberg-text disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <div className="bg-bloomberg-darker border border-bloomberg-border rounded-lg shadow-xl p-3 min-w-[250px]">
              <TooltipContent 
                lastUpdated={lastUpdated}
                source={source}
                confidence={confidence}
                reconciliationStatus={reconciliationStatus}
                freshness={freshness}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Tooltip content component
function TooltipContent({
  lastUpdated,
  source,
  confidence,
  reconciliationStatus,
  freshness,
}: {
  lastUpdated: Date | string
  source: DataSource
  confidence: DataConfidence
  reconciliationStatus?: ReconciliationStatus
  freshness: { level: FreshnessLevel; label: string }
}) {
  const updatedDate = new Date(lastUpdated)
  const freshnessColor = getFreshnessColor(freshness.level)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-bloomberg-border">
        <Info className="w-4 h-4 text-bloomberg-accent" />
        <span className="text-sm font-medium text-bloomberg-text">Data Health</span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs">
        {/* Last Updated */}
        <div className="flex justify-between">
          <span className="text-bloomberg-textMuted">Last Updated:</span>
          <span className={freshnessColor}>
            {updatedDate.toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Source */}
        <div className="flex justify-between">
          <span className="text-bloomberg-textMuted">Source:</span>
          <span className="text-bloomberg-text flex items-center gap-1">
            {getSourceLabel(source)}
            {source !== 'MANUAL' && (
              <ExternalLink className="w-3 h-3 text-bloomberg-accent" />
            )}
          </span>
        </div>

        {/* Confidence */}
        <div className="flex justify-between">
          <span className="text-bloomberg-textMuted">Confidence:</span>
          <span className={`flex items-center gap-1 ${
            confidence === 'VERIFIED' ? 'text-green-400' :
            confidence === 'HIGH' ? 'text-green-400' :
            confidence === 'MEDIUM' ? 'text-amber-400' :
            confidence === 'LOW' ? 'text-orange-500' : 'text-gray-400'
          }`}>
            {confidence === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
            {getConfidenceLabel(confidence)}
          </span>
        </div>

        {/* Reconciliation Status */}
        {reconciliationStatus && (
          <div className="flex justify-between">
            <span className="text-bloomberg-textMuted">Reconciliation:</span>
            <span className={getReconciliationColor(reconciliationStatus)}>
              {getReconciliationLabel(reconciliationStatus)}
            </span>
          </div>
        )}
      </div>

      {/* Warning for stale data */}
      {(freshness.level === 'stale' || freshness.level === 'critical') && (
        <div className={`mt-2 p-2 rounded text-xs ${
          freshness.level === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
        }`}>
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          {freshness.level === 'critical' 
            ? 'Data is significantly outdated. Consider refreshing.'
            : 'Data may be outdated. Verify before making decisions.'
          }
        </div>
      )}
    </div>
  )
}

// ============================================
// WRAPPER COMPONENT
// ============================================

interface DataHealthWrapperProps {
  children: React.ReactNode
  lastUpdated: Date | string
  source: DataSource
  confidence?: DataConfidence
  reconciliationStatus?: ReconciliationStatus
  onRefresh?: () => void
  isRefreshing?: boolean
  /** Position of the indicator */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

/**
 * DataHealthWrapper - Wraps any chart/widget with a data health indicator
 * 
 * Usage:
 * ```tsx
 * <DataHealthWrapper
 *   lastUpdated={new Date()}
 *   source="XERO"
 *   confidence="VERIFIED"
 *   position="top-right"
 * >
 *   <MyChart />
 * </DataHealthWrapper>
 * ```
 */
export function DataHealthWrapper({
  children,
  lastUpdated,
  source,
  confidence = 'MEDIUM',
  reconciliationStatus,
  onRefresh,
  isRefreshing,
  position = 'top-right',
  className = '',
}: DataHealthWrapperProps) {
  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className={`absolute ${positionClasses[position]} z-10`}>
        <DataHealthIndicator
          lastUpdated={lastUpdated}
          source={source}
          confidence={confidence}
          reconciliationStatus={reconciliationStatus}
          badge
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export default DataHealthIndicator

