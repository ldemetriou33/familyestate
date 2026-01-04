'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Building2, Calculator, Shield } from 'lucide-react'
import { seedEstateData } from '@/lib/data/estate-seed'
import { calculateSovereignEquity, calculateTotalConsolidationCost } from '@/lib/calculations/sovereign-equity'
import { calculateCashFlow } from '@/lib/calculations/cash-flow'
import { calculateOakwoodDecay } from '@/lib/calculations/oakwood-decay'
import { updateShadowEquity } from '@/lib/calculations/shadow-equity'
import { buildPruningAssets } from '@/lib/calculations/pruning'
import type { EstatePortfolio, Asset } from '@/lib/types/estate'
import { formatGBP } from '@/lib/utils'
import Link from 'next/link'

export default function SovereignDashboard() {
  const [portfolio, setPortfolio] = useState<EstatePortfolio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load estate data
    const estateData = seedEstateData()
    
    // Calculate sovereign equity
    const sovereignEquity = calculateSovereignEquity(estateData.assets)
    
    // Calculate cash flow
    const cashFlow = calculateCashFlow(estateData.assets)
    
    // Calculate Oakwood Decay
    const oakwoodAsset = estateData.assets.find((a) => a.id === 'oakwood-close')
    let oakwoodDecay = undefined
    if (oakwoodAsset) {
      const equityReleaseDebt = oakwoodAsset.debts.find((d) => d.type === 'EQUITY_RELEASE')
      if (equityReleaseDebt) {
        oakwoodDecay = calculateOakwoodDecay(oakwoodAsset, equityReleaseDebt)
      }
    }
    
    // Calculate consolidation cost
    const consolidationCost = calculateTotalConsolidationCost(estateData.assets)
    
    setPortfolio({
      ...estateData,
      sovereign_equity: {
        ...sovereignEquity,
        consolidation_cost: consolidationCost,
      },
      cash_flow: cashFlow,
      oakwood_decay: oakwoodDecay,
    })
    
    setLoading(false)
  }, [])

  if (loading || !portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const { sovereign_equity, cash_flow, oakwood_decay } = portfolio

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Sovereign Ledger</h1>
        <p className="text-slate-400">True Net Worth vs Gross Value</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-amber-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Total Asset Value</p>
          <p className="text-2xl font-bold text-white">
            {formatGBP(sovereign_equity.total_asset_value)}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-8 h-8 text-red-400" />
            <span className="text-sm text-slate-400">Total Debt</span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Total Debt</p>
          <p className="text-2xl font-bold text-white">
            {formatGBP(sovereign_equity.total_debt)}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
            <span className="text-sm text-slate-400">Dad&apos;s Share</span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Dad&apos;s Equity Share</p>
          <p className="text-2xl font-bold text-white">
            {formatGBP(sovereign_equity.dad_share_equity)}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calculator className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-slate-400">Consolidation</span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Buyout Cost</p>
          <p className="text-2xl font-bold text-white">
            {formatGBP(sovereign_equity.consolidation_cost)}
          </p>
        </div>
      </div>

      {/* Sovereign Equity Breakdown */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Sovereign Equity Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Gross Equity</span>
            <span className="text-lg font-semibold text-white">
              {formatGBP(sovereign_equity.gross_equity)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Dad&apos;s Share (Current)</span>
            <span className="text-lg font-semibold text-green-400">
              {formatGBP(sovereign_equity.dad_share_equity)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Uncles&apos; Share</span>
            <span className="text-lg font-semibold text-slate-400">
              {formatGBP(sovereign_equity.uncles_share_equity)}
            </span>
          </div>
          <div className="border-t border-slate-700 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Consolidation Cost (30% discount)</span>
              <span className="text-lg font-semibold text-amber-400">
                {formatGBP(sovereign_equity.consolidation_cost)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white font-medium">Net Sovereign Equity (After Buyout)</span>
              <span className="text-2xl font-bold text-green-400">
                {formatGBP(sovereign_equity.net_sovereign_equity)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Monthly Cash Flow</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Monthly Income</span>
            <span className="text-lg font-semibold text-green-400">
              {formatGBP(cash_flow.monthly_income)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Monthly Debt Payments</span>
            <span className="text-lg font-semibold text-red-400">
              {formatGBP(cash_flow.monthly_debt_payments)}
            </span>
          </div>
          <div className="border-t border-slate-700 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Free Cash Flow</span>
              <span
                className={`text-2xl font-bold ${
                  cash_flow.is_positive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatGBP(cash_flow.monthly_free_cash_flow)}
              </span>
            </div>
          </div>
          {cash_flow.has_warning && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">
                Cash buffer below warning threshold ({formatGBP(cash_flow.warning_threshold)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Oakwood Decay Tracker */}
      {oakwood_decay && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Oakwood Decay Tracker</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                oakwood_decay.alert_level === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400'
                  : oakwood_decay.alert_level === 'WARNING'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
              }`}
            >
              {oakwood_decay.alert_level}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Equity</span>
              <span className="text-lg font-semibold text-white">
                {formatGBP(oakwood_decay.current_equity)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Daily Interest Accrual</span>
              <span className="text-lg font-semibold text-red-400">
                {formatGBP(oakwood_decay.daily_interest_accrual)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Monthly Decay</span>
              <span className="text-lg font-semibold text-red-400">
                {formatGBP(oakwood_decay.monthly_decay)}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Years Until Equity = 0</span>
                <span className="text-2xl font-bold text-red-400">
                  {oakwood_decay.years_until_zero.toFixed(1)} years
                </span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 text-sm">
                <strong>Strategy:</strong> Sell Mymms Drive to clear Oakwood debt and stop the wealth leak.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

