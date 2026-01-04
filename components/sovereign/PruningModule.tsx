'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import { seedEstateData } from '@/lib/data/estate-seed'
import { buildPruningAssets } from '@/lib/calculations/pruning'
import type { PruningAsset } from '@/lib/types/estate'
import { formatGBP } from '@/lib/utils'

export default function PruningModule() {
  const [pruningAssets, setPruningAssets] = useState<PruningAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const portfolio = seedEstateData()
    const assets = buildPruningAssets(portfolio.assets)
    setPruningAssets(assets)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Pruning Module</h2>
        <p className="text-slate-400">Assets for sale with countdown timers</p>
      </div>

      {pruningAssets.length > 0 ? (
        <div className="space-y-4">
          {pruningAssets.map((asset) => (
            <div
              key={asset.asset_id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <h3 className="text-xl font-semibold text-white">{asset.asset_name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(
                        asset.urgency
                      )}`}
                    >
                      {asset.urgency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Current Value</p>
                      <p className="text-lg font-semibold text-white">
                        {formatGBP(asset.current_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Sell By Date</p>
                      <p className="text-sm font-semibold text-white">
                        {formatDate(asset.sell_by_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Days Remaining</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <p
                          className={`text-lg font-bold ${
                            asset.days_remaining < 90
                              ? 'text-red-400'
                              : asset.days_remaining < 180
                                ? 'text-orange-400'
                                : 'text-yellow-400'
                          }`}
                        >
                          {asset.days_remaining} days
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Reason</p>
                      <p className="text-sm text-slate-300">{asset.reason}</p>
                    </div>
                  </div>

                  {asset.urgency === 'CRITICAL' && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium mb-1">Urgent Action Required</p>
                        <p className="text-sm text-red-300">
                          This asset must be sold before {formatDate(asset.sell_by_date)} to avoid
                          regulatory penalties.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
          <TrendingDown className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Assets for Sale</h3>
          <p className="text-slate-400">All assets are in strategic hold or operational status.</p>
        </div>
      )}
    </div>
  )
}

