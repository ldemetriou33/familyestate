'use client'

import { Building2, TrendingUp, TrendingDown, AlertTriangle, Shield, Car } from 'lucide-react'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'
import { formatGBP, formatEUR } from '@/lib/utils'

interface AssetCardProps {
  asset: SovereignAsset
}

export default function AssetCard({ asset }: AssetCardProps) {
  const formatCurrency = asset.currency === 'GBP' ? formatGBP : formatEUR
  const netValue = asset.valuation - (asset.debt?.principal || 0)
  const dadEquity = (netValue * asset.ownership.dad) / 100

  // Tier colors
  const tierColors = {
    S: 'from-amber-500/20 to-orange-500/20 border-amber-500/50', // Engine
    A: 'from-purple-500/20 to-indigo-500/20 border-purple-500/50', // Sovereign
    B: 'from-green-500/20 to-emerald-500/20 border-green-500/50', // Liquidity
    C: 'from-red-500/20 to-rose-500/20 border-red-500/50', // Liability
    D: 'from-slate-500/20 to-gray-500/20 border-slate-500/50', // Other
  }

  // Status badges
  const getStatusBadge = () => {
    switch (asset.status) {
      case 'LEASED':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            LEASED
          </span>
        )
      case 'STRATEGIC_HOLD':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
            STRATEGIC HOLD
          </span>
        )
      case 'RENOVATION':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            RENOVATION
          </span>
        )
      case 'PRUNE':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-red-500/20 text-red-400 border border-red-500/30">
            PRUNE
          </span>
        )
      default:
        return null
    }
  }

  // Vault indicator
  const isVaulted = asset.ownership.entity === 'DIFC_FOUNDATION'
  const isPersonal = asset.ownership.entity === 'PERSONAL'

  return (
    <div
      className={`bg-gradient-to-br ${tierColors[asset.tier]} border-2 rounded-xl p-6 hover:scale-[1.02] transition-transform`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {asset.tier === 'S' && <Car className="w-6 h-6 text-amber-400" />}
          {asset.tier === 'A' && <Shield className="w-6 h-6 text-purple-400" />}
          {asset.tier === 'B' && <TrendingUp className="w-6 h-6 text-green-400" />}
          {asset.tier === 'C' && <TrendingDown className="w-6 h-6 text-red-400" />}
          <div>
            <h3 className="text-xl font-bold text-white">{asset.name}</h3>
            <p className="text-sm text-slate-400">{asset.location}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-3 py-1 text-lg font-bold rounded bg-slate-900/50 text-amber-400 border border-amber-500/30">
            {asset.tier}-TIER
          </span>
          {getStatusBadge()}
        </div>
      </div>

      {/* Vault Indicator */}
      <div className="mb-4">
        {isVaulted ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">DIFC Foundation (Vaulted)</span>
          </div>
        ) : isPersonal ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Personal Name (Risk)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">{asset.ownership.entity}</span>
          </div>
        )}
      </div>

      {/* Valuation */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Gross Value</p>
          <p className="text-lg font-bold text-white">{formatCurrency(asset.valuation)}</p>
        </div>
        {asset.debt && (
          <div>
            <p className="text-xs text-slate-400 mb-1">Debt</p>
            <p className="text-lg font-bold text-red-400">
              {formatCurrency(asset.debt.principal)}
            </p>
          </div>
        )}
      </div>

      {/* Ownership */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">Ownership</p>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-400">Dad</p>
            <p className="text-sm font-semibold text-amber-400">{asset.ownership.dad}%</p>
          </div>
          {asset.ownership.uncles > 0 && (
            <div>
              <p className="text-xs text-slate-400">Uncles</p>
              <p className="text-sm font-semibold text-slate-400">{asset.ownership.uncles}%</p>
            </div>
          )}
        </div>
        {asset.ownership.uncles > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-xs text-amber-400">Goal: Consolidation to 100%</p>
          </div>
        )}
      </div>

      {/* Dad's Equity */}
      <div className="mb-4 p-3 bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-slate-400 mb-1">Dad&apos;s Sovereign Equity</p>
        <p className="text-2xl font-bold text-amber-400">{formatCurrency(dadEquity)}</p>
      </div>

      {/* Metadata */}
      {asset.metadata && (
        <div className="space-y-2 text-sm text-slate-300">
          {asset.metadata.targetRent && (
            <p>
              <span className="text-slate-400">Target Rent:</span>{' '}
              {formatCurrency(asset.metadata.targetRent)}/yr
            </p>
          )}
          {asset.metadata.spaces && (
            <p>
              <span className="text-slate-400">Spaces:</span> {asset.metadata.spaces}
            </p>
          )}
          {asset.metadata.eventModePrice && (
            <p>
              <span className="text-slate-400">Event Mode:</span> £
              {asset.metadata.eventModePrice}/space
            </p>
          )}
          {asset.metadata.heritageGrantEligible && (
            <p>
              <span className="text-slate-400">Heritage Grant:</span>{' '}
              {formatEUR(asset.metadata.heritageGrantEligible)} potential
            </p>
          )}
          {asset.metadata.zoningUplift && (
            <p>
              <span className="text-slate-400">Zoning Uplift:</span> Expected{' '}
              {asset.metadata.zoningUplift}
            </p>
          )}
          {asset.metadata.targetExit && (
            <p>
              <span className="text-slate-400">Target Exit:</span>{' '}
              {formatCurrency(asset.metadata.targetExit)}
            </p>
          )}
          {asset.metadata.netLiquidity && (
            <p>
              <span className="text-slate-400">Net Liquidity:</span>{' '}
              <span className="text-green-400 font-semibold">
                +{formatCurrency(asset.metadata.netLiquidity)}
              </span>
            </p>
          )}
          {asset.metadata.sellByDate && (
            <p>
              <span className="text-red-400 font-semibold">
                Sell By: {new Date(asset.metadata.sellByDate).toLocaleDateString()}
              </span>
            </p>
          )}
          {asset.metadata.notes && (
            <p className="text-xs text-slate-400 italic mt-2">{asset.metadata.notes}</p>
          )}
        </div>
      )}

      {/* Wealth Decay Progress Bar (for Oakwood) */}
      {asset.id === 'oakwood-close' && asset.debt && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-400">Wealth Decay Alert</span>
            <span className="text-xs text-red-400">
              {asset.debt.interestRate}% Compounding
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: '45%' }} // Example: 45% of equity consumed
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Equity Release: {formatCurrency(asset.debt.principal)} @ {asset.debt.interestRate}%
          </p>
        </div>
      )}
    </div>
  )
}

