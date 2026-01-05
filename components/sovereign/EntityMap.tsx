'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Building2, User, Shield } from 'lucide-react'
import { useSovereignStore } from '@/lib/store/sovereign-store'
import { formatGBP } from '@/lib/utils'

export default function EntityMap() {
  const { entities, getAssetsByEntity, getEntityTotals } = useSovereignStore()
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set())

  const toggleEntity = (entityId: string) => {
    const newExpanded = new Set(expandedEntities)
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId)
    } else {
      newExpanded.add(entityId)
    }
    setExpandedEntities(newExpanded)
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'Corporate':
        return <Building2 className="w-5 h-5 text-blue-600" />
      case 'Individual':
        return <User className="w-5 h-5 text-green-600" />
      case 'Trust/Foundation':
        return <Shield className="w-5 h-5 text-purple-600" />
      default:
        return <Building2 className="w-5 h-5 text-slate-600" />
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Entity Map</h3>
      <div className="space-y-2 lg:space-y-3">
        {entities.map((entity) => {
          const isExpanded = expandedEntities.has(entity.id)
          const assets = getAssetsByEntity(entity.id)
          const totals = getEntityTotals(entity.id)
          const dadShare = entity.shareholders.find((s) => s.name === 'Dad')?.percentage || 0

          return (
            <div key={entity.id} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Entity Header */}
              <button
                onClick={() => toggleEntity(entity.id)}
                className="w-full flex items-center justify-between p-3 lg:p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  {getEntityIcon(entity.type)}
                  <div className="text-left">
                    <p className="font-medium text-slate-900">{entity.name}</p>
                    <p className="text-xs text-slate-500">{entity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatGBP(totals.totalValue)}</p>
                  <p className="text-xs text-slate-500">
                    {assets.length} asset{assets.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>

              {/* Entity Details (Expanded) */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50 p-3 lg:p-4">
                  {/* Entity Metrics */}
                  <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-3 lg:mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Total Value</p>
                      <p className="text-sm font-semibold text-slate-900">{formatGBP(totals.totalValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Total Debt</p>
                      <p className="text-sm font-semibold text-slate-900">{formatGBP(totals.totalDebt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Net Equity</p>
                      <p className="text-sm font-semibold text-slate-900">{formatGBP(totals.netEquity)}</p>
                    </div>
                  </div>

                  {/* Shareholders */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-700 mb-2">Ownership</p>
                    <div className="flex gap-4">
                      {entity.shareholders.map((shareholder, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="text-slate-600">{shareholder.name}:</span>{' '}
                          <span className="font-medium text-slate-900">{shareholder.percentage}%</span>
                        </div>
                      ))}
                    </div>
                    {dadShare > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Principal Equity: {formatGBP((totals.netEquity * dadShare) / 100)}
                      </p>
                    )}
                  </div>

                  {/* Assets List */}
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-2">Assets</p>
                    <div className="space-y-2">
                      {assets.map((asset) => (
                        <div
                          key={asset.id}
                          className="bg-white border border-slate-200 rounded p-2.5 lg:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{asset.name}</p>
                            <p className="text-xs text-slate-500">
                              {asset.status} • {formatGBP(asset.valuation)}
                            </p>
                            {asset.updated_at && asset.updated_by && (
                              <p className="text-xs text-slate-400 mt-1">
                                Last Updated: {asset.updated_by} • {new Date(asset.updated_at).toLocaleDateString('en-GB')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-600">
                              {formatGBP(asset.revenue_monthly)}/mo
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

