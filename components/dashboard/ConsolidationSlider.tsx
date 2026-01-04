'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, TrendingUp, Shield } from 'lucide-react'
import { runConsolidationScenario } from '@/lib/logic/consolidation'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'
import { formatGBP } from '@/lib/utils'

interface ConsolidationSliderProps {
  assets: SovereignAsset[]
  initialCashInjection: number
  onScenarioChange: (scenario: any) => void
  onCashInjectionChange?: (value: number) => void
}

export default function ConsolidationSlider({
  assets,
  initialCashInjection,
  onScenarioChange,
  onCashInjectionChange,
}: ConsolidationSliderProps) {
  const [cashInjection, setCashInjection] = useState(initialCashInjection)
  const [scenario, setScenario] = useState<any>(null)

  // Sync with parent when initialCashInjection changes
  useEffect(() => {
    setCashInjection(initialCashInjection)
  }, [initialCashInjection])

  const handleSliderChange = (value: number) => {
    setCashInjection(value)
    onCashInjectionChange?.(value)
  }

  useEffect(() => {
    if (assets.length === 0) return
    const newScenario = runConsolidationScenario(assets, cashInjection)
    setScenario(newScenario)
    onScenarioChange(newScenario)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashInjection, assets])

  if (!scenario) return null

  const consolidationScore = Math.min(
    100,
    ((scenario.buyoutPower.oraHouse.percentage +
      scenario.buyoutPower.parekklisia.percentage +
      scenario.buyoutPower.hotel.percentage) /
      3) *
      100
  )

  const oakwoodCleared = cashInjection >= (scenario.interestSaved.oakwoodDebt || 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="w-6 h-6 text-amber-400" />
        <h2 className="text-2xl font-bold text-zinc-100">Consolidation Simulator</h2>
      </div>

      {/* Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-400">Cash Injection</label>
          <span className="text-2xl font-bold text-amber-400">{formatGBP(cashInjection)}</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="2000000"
            step="10000"
            value={cashInjection}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, 
                #f59e0b 0%, 
                #f59e0b ${(cashInjection / 2000000) * 100}%, 
                #27272a ${(cashInjection / 2000000) * 100}%, 
                #27272a 100%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>£0</span>
            <span>£2M</span>
          </div>
        </div>
      </div>

      {/* Consolidation Score Gauge */}
      <div className="relative h-32 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-400">Consolidation Score</span>
          <span className="text-2xl font-bold text-amber-400">{consolidationScore.toFixed(0)}%</span>
        </div>
        <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${consolidationScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="grid grid-cols-2 gap-4">
        {/* Uncles Share Shrinking */}
        <motion.div
          className="p-4 bg-zinc-900 rounded-xl border border-zinc-800"
          layout
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Uncles&apos; Share</span>
            <span className="text-lg font-bold text-rose-400">
              {(
                ((scenario.buyoutPower.oraHouse.remaining +
                  scenario.buyoutPower.parekklisia.remaining +
                  scenario.buyoutPower.hotel.remaining) /
                  3) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-rose-500"
              initial={{ width: '100%' }}
              animate={{
                width: `${
                  ((scenario.buyoutPower.oraHouse.remaining +
                    scenario.buyoutPower.parekklisia.remaining +
                    scenario.buyoutPower.hotel.remaining) /
                    3) *
                  100
                }%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Oakwood Debt Status */}
        <AnimatePresence>
          {!oakwoodCleared ? (
            <motion.div
              key="debt-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-zinc-900 rounded-xl border border-rose-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Oakwood Debt</span>
                <span className="text-lg font-bold text-rose-400">Active</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-500"
                  initial={{ width: '100%' }}
                  animate={{ width: '100%' }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="debt-cleared"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 bg-zinc-900 rounded-xl border border-emerald-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Oakwood Debt</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-400">Cleared</span>
                </div>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buyout Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-xs text-zinc-400 mb-1">Ora House</p>
          <p className="text-lg font-bold text-white">
            {scenario.buyoutPower.oraHouse.canBuy ? '100%' : `${scenario.buyoutPower.oraHouse.percentage.toFixed(1)}%`}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{formatGBP(scenario.buyoutPower.oraHouse.cost)}</p>
        </div>
        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-xs text-zinc-400 mb-1">Parekklisia</p>
          <p className="text-lg font-bold text-white">
            {scenario.buyoutPower.parekklisia.canBuy ? '100%' : `${scenario.buyoutPower.parekklisia.percentage.toFixed(1)}%`}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{formatGBP(scenario.buyoutPower.parekklisia.cost)}</p>
        </div>
        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-xs text-zinc-400 mb-1">Hotel</p>
          <p className="text-lg font-bold text-white">
            {scenario.buyoutPower.hotel.canBuy ? '100%' : `${scenario.buyoutPower.hotel.percentage.toFixed(1)}%`}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{formatGBP(scenario.buyoutPower.hotel.cost)}</p>
        </div>
      </div>
    </div>
  )
}

