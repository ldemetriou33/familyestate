'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle, Clock, AlertCircle, Calculator } from 'lucide-react'
import { seedEstateData } from '@/lib/data/estate-seed'
import { buildConsolidationRoadmap, calculateMymmsSaleImpact } from '@/lib/calculations/consolidation-roadmap'
import type { ConsolidationRoadmap, Asset } from '@/lib/types/estate'
import { formatGBP } from '@/lib/utils'

export default function ConsolidationRoadmapView() {
  const [roadmap, setRoadmap] = useState<ConsolidationRoadmap | null>(null)
  const [mymmsImpact, setMymmsImpact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const portfolio = seedEstateData()
    const roadmapData = buildConsolidationRoadmap(portfolio.assets)
    
    // Calculate Mymms sale impact
    const mymmsAsset = portfolio.assets.find((a) => a.id === 'mymms-drive')
    const oakwoodAsset = portfolio.assets.find((a) => a.id === 'oakwood-close')
    
    if (mymmsAsset && oakwoodAsset) {
      const mymmsDebt = mymmsAsset.debts.reduce((sum, d) => sum + d.current_balance, 0)
      const mymmsSalePrice = mymmsAsset.valuation // Assuming sale at valuation
      const oakwoodDebt = oakwoodAsset.debts.reduce((sum, d) => sum + d.current_balance, 0)
      
      const impact = calculateMymmsSaleImpact(
        mymmsSalePrice,
        mymmsDebt,
        oakwoodDebt,
        roadmapData.total_buyout_cost
      )
      setMymmsImpact(impact)
    }
    
    setRoadmap(roadmapData)
    setLoading(false)
  }, [])

  if (loading || !roadmap) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default:
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Consolidation Roadmap</h2>
        <p className="text-slate-400">Step-by-step path to 100% ownership of Core 4 assets</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calculator className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-slate-400">Total Cost</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatGBP(roadmap.total_buyout_cost)}
          </p>
          <p className="text-xs text-slate-400 mt-2">30% minority discount applied</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-400" />
            <span className="text-sm text-slate-400">Timeline</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {roadmap.estimated_timeline_months} months
          </p>
          <p className="text-xs text-slate-400 mt-2">Estimated completion</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-sm text-slate-400">Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {roadmap.current_progress}%
          </p>
          <p className="text-xs text-slate-400 mt-2">Steps completed</p>
        </div>
      </div>

      {/* Mymms Sale Impact */}
      {mymmsImpact && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Mymms Sale Impact Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Sale Profit</p>
              <p className="text-lg font-semibold text-green-400">
                {formatGBP(mymmsImpact.profit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Oakwood Payoff</p>
              <p className="text-lg font-semibold text-white">
                {formatGBP(mymmsImpact.oakwoodPayoff)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Remaining for Consolidation</p>
              <p className="text-lg font-semibold text-amber-400">
                {formatGBP(mymmsImpact.remainingForConsolidation)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Can Complete?</p>
              <div className="flex items-center gap-2">
                {mymmsImpact.canCompleteConsolidation ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-lg font-semibold text-white">
                  {mymmsImpact.canCompleteConsolidation ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Steps */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Consolidation Steps</h3>
        {roadmap.steps.map((step) => (
          <div
            key={step.step_number}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                    {step.step_number}
                  </div>
                  <h4 className="text-lg font-semibold text-white">{step.asset_name}</h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(
                      step.priority
                    )}`}
                  >
                    {step.priority} Priority
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Current Ownership</p>
                    <p className="text-sm font-semibold text-white">
                      {step.current_ownership.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Target Ownership</p>
                    <p className="text-sm font-semibold text-green-400">
                      {step.target_ownership}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Buyout Cost</p>
                    <p className="text-sm font-semibold text-amber-400">
                      {formatGBP(step.buyout_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        step.status === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-400'
                          : step.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

