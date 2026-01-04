'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Building2 } from 'lucide-react'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'

interface VaultStatusProps {
  assets: SovereignAsset[]
}

export default function VaultStatus({ assets }: VaultStatusProps) {
  const [selectedAsset, setSelectedAsset] = useState<SovereignAsset | null>(null)

  const vaultedAssets = assets.filter((a) => a.ownership.entity === 'DIFC_FOUNDATION')
  const personalAssets = assets.filter((a) => a.ownership.entity === 'PERSONAL')
  const protectedPercentage = (vaultedAssets.length / assets.length) * 100

  const handleMoveToDIFC = (asset: SovereignAsset) => {
    // Mock action - in production, this would call an API
    console.log(`Moving ${asset.name} to DIFC Foundation`)
    setSelectedAsset(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-amber-400" />
        <h2 className="text-2xl font-bold text-zinc-100">Vault Status</h2>
      </div>

      {/* Ring Chart */}
      <div className="relative w-64 h-64 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#27272a"
            strokeWidth="8"
          />
          {/* Protected Segment */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - protectedPercentage / 100)}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - protectedPercentage / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-zinc-100">{protectedPercentage.toFixed(0)}%</span>
          <span className="text-sm text-zinc-400">Protected</span>
        </div>
      </div>

      {/* Asset Segments */}
      <div className="grid grid-cols-2 gap-3">
        {/* Vaulted Assets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-400">DIFC Foundation</span>
          </div>
          {vaultedAssets.length > 0 ? (
            vaultedAssets.map((asset) => (
              <motion.div
                key={asset.id}
                className="p-3 bg-zinc-900 rounded-lg border border-emerald-500/30 cursor-pointer"
                whileHover={{ scale: 1.02, borderColor: '#10b981' }}
                onClick={() => setSelectedAsset(asset)}
              >
                <p className="text-sm text-zinc-100">{asset.name}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-xs text-zinc-500">No assets vaulted</p>
          )}
        </div>

        {/* Risk Assets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-zinc-400">Personal Name (Risk)</span>
          </div>
          {personalAssets.map((asset) => (
            <motion.div
              key={asset.id}
              className="p-3 bg-zinc-900 rounded-lg border border-rose-500/30 cursor-pointer"
              whileHover={{ scale: 1.02, borderColor: '#f43f5e' }}
              onClick={() => setSelectedAsset(asset)}
            >
              <p className="text-sm text-zinc-100">{asset.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedAsset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-zinc-100 mb-4">
              Move to DIFC Foundation?
            </h3>
            <p className="text-zinc-400 mb-6">
              Move <strong className="text-zinc-100">{selectedAsset.name}</strong> to the DIFC
              Foundation for succession planning?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleMoveToDIFC(selectedAsset)}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setSelectedAsset(null)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

