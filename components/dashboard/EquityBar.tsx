'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatGBP } from '@/lib/utils'

interface EquityBarProps {
  totalGrossValue: number
  totalDebt: number
  dadEquity: number
  unclesEquity: number
}

export default function EquityBar({
  totalGrossValue,
  totalDebt,
  dadEquity,
  unclesEquity,
}: EquityBarProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)

  const grossEquity = totalGrossValue - totalDebt
  const debtPercentage = (totalDebt / totalGrossValue) * 100
  const dadPercentage = (dadEquity / totalGrossValue) * 100
  const unclesPercentage = (unclesEquity / totalGrossValue) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-100">True Equity Breakdown</h2>
        <span className="text-sm text-zinc-400">Total: {formatGBP(totalGrossValue)}</span>
      </div>

      {/* Interactive Bar */}
      <div className="relative h-16 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
        {/* Uncles Share - Red */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-600 to-rose-500 flex items-center justify-center cursor-pointer group"
          style={{ width: `${unclesPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${unclesPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onHoverStart={() => setHoveredSegment('uncles')}
          onHoverEnd={() => setHoveredSegment(null)}
          whileHover={{ scale: 1.05, zIndex: 10 }}
        >
          {hoveredSegment === 'uncles' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-rose-500/90"
            >
              <span className="text-sm font-bold text-white">
                Uncles: {formatGBP(unclesEquity)} ({unclesPercentage.toFixed(1)}%)
              </span>
            </motion.div>
          )}
          {hoveredSegment !== 'uncles' && unclesPercentage > 5 && (
            <span className="text-xs font-medium text-white/80">Uncles</span>
          )}
        </motion.div>

        {/* Dad's Share - Gold */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center cursor-pointer group"
          style={{ left: `${unclesPercentage}%`, width: `${dadPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${dadPercentage}%`, left: `${unclesPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          onHoverStart={() => setHoveredSegment('dad')}
          onHoverEnd={() => setHoveredSegment(null)}
          whileHover={{ scale: 1.05, zIndex: 10 }}
        >
          {hoveredSegment === 'dad' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-amber-500/90"
            >
              <span className="text-sm font-bold text-zinc-900">
                Dad&apos;s Sovereign Equity: {formatGBP(dadEquity)} ({dadPercentage.toFixed(1)}%)
              </span>
            </motion.div>
          )}
          {hoveredSegment !== 'dad' && dadPercentage > 5 && (
            <span className="text-xs font-medium text-zinc-900">Dad&apos;s Share</span>
          )}
        </motion.div>

        {/* Debt - Dark */}
        <motion.div
          className="absolute right-0 top-0 h-full bg-gradient-to-r from-zinc-800 to-zinc-700 flex items-center justify-center cursor-pointer"
          style={{ width: `${debtPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${debtPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          onHoverStart={() => setHoveredSegment('debt')}
          onHoverEnd={() => setHoveredSegment(null)}
          whileHover={{ scale: 1.05, zIndex: 10 }}
        >
          {hoveredSegment === 'debt' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-zinc-700/90"
            >
              <span className="text-sm font-bold text-white">
                Debt: {formatGBP(totalDebt)} ({debtPercentage.toFixed(1)}%)
              </span>
            </motion.div>
          )}
          {hoveredSegment !== 'debt' && debtPercentage > 5 && (
            <span className="text-xs font-medium text-white/80">Debt</span>
          )}
        </motion.div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500" />
          <span className="text-zinc-400">Uncles ({unclesPercentage.toFixed(1)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500" />
          <span className="text-zinc-400">Dad&apos;s Equity ({dadPercentage.toFixed(1)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-700" />
          <span className="text-zinc-400">Debt ({debtPercentage.toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  )
}

