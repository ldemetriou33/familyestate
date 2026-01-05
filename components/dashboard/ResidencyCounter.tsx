'use client'

import { useState } from 'react'
import { Calendar, AlertTriangle, Info } from 'lucide-react'
import { useSovereignStore } from '@/lib/store/sovereign-store'

export default function ResidencyCounter() {
  const { assets } = useSovereignStore()
  const mymmsAsset = assets.find((a) => a.id === 'asset-mymms-drive')
  
  // This would typically come from a database or user input
  // For now, we'll use localStorage to persist the count
  const [ukDaysUsed, setUkDaysUsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('uk-residency-days')
      return stored ? parseInt(stored, 10) : 0
    }
    return 0
  })

  const maxDays = 16
  const remainingDays = maxDays - ukDaysUsed
  const isWarning = ukDaysUsed >= maxDays * 0.75 // Warning at 75% (12 days)
  const isCritical = ukDaysUsed >= maxDays

  if (!mymmsAsset || mymmsAsset.status !== 'Primary Residence') {
    return null
  }

  const handleIncrement = () => {
    if (ukDaysUsed < maxDays) {
      const newValue = ukDaysUsed + 1
      setUkDaysUsed(newValue)
      if (typeof window !== 'undefined') {
        localStorage.setItem('uk-residency-days', newValue.toString())
      }
    }
  }

  const handleReset = () => {
    setUkDaysUsed(0)
    if (typeof window !== 'undefined') {
      localStorage.setItem('uk-residency-days', '0')
    }
  }

  return (
    <div className="p-3 lg:p-4 border-t border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-600" />
          <span className="text-xs lg:text-sm font-medium text-slate-900">UK Residency Counter</span>
        </div>
        <div className="group relative">
          <Info className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 cursor-help touch-manipulation" />
          <div className="absolute bottom-full right-0 mb-2 w-56 lg:w-64 p-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Staying at Mymms Drive triggers the Accommodation Tie. Do not exceed 16 nights per year to maintain Dubai residency.
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">Days Used:</span>
          <span
            className={`text-sm font-semibold ${
              isCritical
                ? 'text-red-600'
                : isWarning
                ? 'text-amber-600'
                : 'text-slate-900'
            }`}
          >
            {ukDaysUsed} / {maxDays}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCritical
                ? 'bg-red-600'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min((ukDaysUsed / maxDays) * 100, 100)}%` }}
          />
        </div>
        
        {isCritical && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Limit exceeded! Residency at risk.</span>
          </div>
        )}
        
        {isWarning && !isCritical && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Approaching limit ({remainingDays} days remaining)</span>
          </div>
        )}
        
        {!isCritical && (
          <div className="flex gap-2">
            <button
              onClick={handleIncrement}
              disabled={ukDaysUsed >= maxDays}
              className="flex-1 px-3 py-2 lg:px-2 lg:py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px] lg:min-h-0"
            >
              +1 Day
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 lg:px-2 lg:py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 active:bg-slate-400 transition-colors touch-manipulation min-h-[44px] lg:min-h-0"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

