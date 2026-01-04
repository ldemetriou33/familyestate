'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Car, Shield, TrendingUp, TrendingDown, Building2, AlertTriangle } from 'lucide-react'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'
import { formatGBP, formatEUR } from '@/lib/utils'

interface AssetBentoGridProps {
  assets: SovereignAsset[]
  eventModeActive?: boolean
  onEventModeToggle?: (assetId: string) => void
}

export default function AssetBentoGrid({
  assets,
  eventModeActive = false,
  onEventModeToggle,
}: AssetBentoGridProps) {
  const [decayValue, setDecayValue] = useState(400_000)

  // Mock decay animation for Oakwood
  useEffect(() => {
    const interval = setInterval(() => {
      setDecayValue((prev) => prev + 10) // £10 per second (mock)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'S':
        return <Car className="w-6 h-6 text-amber-400" />
      case 'A':
        return <Shield className="w-6 h-6 text-purple-400" />
      case 'B':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />
      case 'C':
        return <TrendingDown className="w-6 h-6 text-rose-400" />
      default:
        return <Building2 className="w-6 h-6 text-zinc-400" />
    }
  }

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'S':
        return 'from-amber-500/10 to-orange-500/10 border-amber-500/30'
      case 'A':
        return 'from-purple-500/10 to-indigo-500/10 border-purple-500/30'
      case 'B':
        return 'from-emerald-500/10 to-green-500/10 border-emerald-500/30'
      case 'C':
        return 'from-rose-500/10 to-red-500/10 border-rose-500/30'
      default:
        return 'from-zinc-500/10 to-gray-500/10 border-zinc-500/30'
    }
  }

  const formatCurrency = (asset: SovereignAsset) =>
    asset.currency === 'GBP' ? formatGBP : formatEUR

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset, index) => {
        const isHotel = asset.id === 'abbey-point-hotel'
        const isCarPark = asset.id === 'wembley-car-park'
        const isOakwood = asset.id === 'oakwood-close'

        return (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-gradient-to-br ${getTierColors(asset.tier)} border-2 rounded-xl p-6 hover:scale-[1.02] transition-transform ${
              isHotel ? 'md:col-span-2' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTierIcon(asset.tier)}
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{asset.name}</h3>
                  <p className="text-xs text-zinc-400">{asset.location}</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-bold rounded bg-zinc-800 text-amber-400 border border-amber-500/30">
                {asset.tier}-TIER
              </span>
            </div>

            {/* Hotel - Lease Pulse */}
            {isHotel && (
              <div className="mb-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Lease Status</span>
                  <motion.div
                    className="w-3 h-3 rounded-full bg-emerald-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p className="text-xl font-bold text-emerald-400">
                  {formatGBP(asset.metadata.targetRent || 0)}/yr
                </p>
                <p className="text-xs text-zinc-500 mt-1">Triple Net Lease</p>
              </div>
            )}

            {/* Car Park - Event Mode Toggle */}
            {isCarPark && (
              <div className="mb-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Wembley Event Mode</span>
                  <button
                    onClick={() => onEventModeToggle?.(asset.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      eventModeActive ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                      animate={{ x: eventModeActive ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-sm text-zinc-300">
                  {eventModeActive ? 'Event Mode: £50/space' : 'Normal Mode: £20/space'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{asset.metadata.spaces} spaces</p>
              </div>
            )}

            {/* Oakwood - Decay Animation */}
            {isOakwood && asset.debt && (
              <div className="mb-4 p-4 bg-rose-500/10 rounded-lg border border-rose-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-rose-400">Wealth Decay</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <motion.p
                  key={decayValue}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold text-rose-400"
                >
                  {formatGBP(decayValue)}
                </motion.p>
                <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-rose-500"
                    initial={{ width: '45%' }}
                    animate={{ width: '50%' }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {asset.debt.interestRate}% Compounding
                </p>
              </div>
            )}

            {/* Valuation */}
            <div className="mb-4">
              <p className="text-xs text-zinc-400 mb-1">Valuation</p>
              <p className="text-2xl font-bold text-zinc-100">
                {formatCurrency(asset)(asset.valuation)}
              </p>
              {asset.debt && (
                <p className="text-sm text-rose-400 mt-1">
                  Debt: {formatCurrency(asset)(asset.debt.principal)}
                </p>
              )}
            </div>

            {/* Ownership */}
            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-400 mb-2">Ownership</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Dad</p>
                  <p className="text-sm font-semibold text-amber-400">{asset.ownership.dad}%</p>
                </div>
                {asset.ownership.uncles > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500">Uncles</p>
                    <p className="text-sm font-semibold text-rose-400">{asset.ownership.uncles}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
              <span
                className={`px-3 py-1 text-xs font-medium rounded ${
                  asset.status === 'LEASED'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : asset.status === 'STRATEGIC_HOLD'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : asset.status === 'RENOVATION'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : asset.status === 'PRUNE'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {asset.status}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

