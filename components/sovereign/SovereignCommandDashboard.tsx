'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calculator, Car, Shield, AlertTriangle } from 'lucide-react'
import { seedSovereignEstate, getAssetsByTier, type SovereignEstate } from '@/lib/data/sovereign-seed'
import { runConsolidationScenario } from '@/lib/logic/consolidation'
import { calculateGlobalCashFlow, DEFAULT_CASH_FLOW_INPUTS } from '@/lib/logic/cash-flow'
import { useWembleyEvents } from '@/lib/hooks/useWembleyEvents'
import AssetCard from './AssetCard'
import { formatGBP } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function SovereignCommandDashboard() {
  const [estate, setEstate] = useState<SovereignEstate | null>(null)
  const [cashInjection, setCashInjection] = useState(1_050_000) // $200k + £850k Mymms
  const [consolidationScenario, setConsolidationScenario] = useState<any>(null)
  const [cashFlow, setCashFlow] = useState<any>(null)
  const { events, eventModeActive, calculateMonthlyRevenue } = useWembleyEvents()

  useEffect(() => {
    const estateData = seedSovereignEstate()
    setEstate(estateData)

    // Calculate consolidation scenario
    const scenario = runConsolidationScenario(estateData.assets, cashInjection)
    setConsolidationScenario(scenario)

    // Calculate cash flow
    const carParkAsset = estateData.assets.find((a) => a.id === 'wembley-car-park')
    const carParkNormal = DEFAULT_CASH_FLOW_INPUTS.carParkNormal
    const carParkEvent = carParkAsset?.metadata.spaces
      ? calculateMonthlyRevenue(
          20, // Normal daily rate per space
          50, // Event rate per space
          carParkAsset.metadata.spaces
        )
      : 0

    const flow = calculateGlobalCashFlow({
      ...DEFAULT_CASH_FLOW_INPUTS,
      carParkEvent: carParkEvent - carParkNormal, // Additional event revenue
    })
    setCashFlow(flow)
  }, [cashInjection, calculateMonthlyRevenue]), [cashInjection, calculateMonthlyRevenue])

  if (!estate || !consolidationScenario || !cashFlow) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const sTierAssets = getAssetsByTier(estate, 'S')
  const aTierAssets = getAssetsByTier(estate, 'A')
  const bTierAssets = getAssetsByTier(estate, 'B')
  const cTierAssets = getAssetsByTier(estate, 'C')

  // Net Worth projection data (12 months)
  const netWorthProjection = Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() + i)
    return {
      month: month.toLocaleDateString('en-GB', { month: 'short' }),
      gross: estate.totalGrossValue,
      debt: estate.totalDebt + (estate.totalDebt * 0.005 * i), // Debt grows slightly
      dadEquity: estate.dadEquity + (cashFlow.monthlySovereignSalary * i),
    }
  })

  return (
    <div className="min-h-screen bg-slate-900 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Sovereign Command Dashboard</h1>
          <p className="text-slate-400">Single Family Office - Asset Orchestration</p>
        </div>
        <div className="flex items-center gap-4">
          {eventModeActive && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <Car className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Wembley Event Mode Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Split-Screen: Gross Estate vs True Sovereign Equity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Gross Estate Value */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Gross Estate Value</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Asset Value</p>
              <p className="text-4xl font-bold text-white">{formatGBP(estate.totalGrossValue)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Debt</p>
              <p className="text-2xl font-bold text-red-400">{formatGBP(estate.totalDebt)}</p>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="text-sm text-slate-400 mb-1">Gross Equity</p>
              <p className="text-3xl font-bold text-green-400">
                {formatGBP(estate.totalGrossValue - estate.totalDebt)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: True Sovereign Equity */}
        <div className="bg-gradient-to-br from-amber-500/20 to-purple-500/20 border-2 border-amber-500/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">True Sovereign Equity</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Dad&apos;s Share</p>
              <p className="text-5xl font-bold text-amber-400">{formatGBP(estate.dadEquity)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Uncles&apos; Share</p>
              <p className="text-2xl font-bold text-slate-400">{formatGBP(estate.unclesEquity)}</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: `${(estate.dadEquity / (estate.totalGrossValue - estate.totalDebt)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-slate-400">
                {((estate.dadEquity / (estate.totalGrossValue - estate.totalDebt)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Indicator */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">The Vault Indicator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
            <Shield className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">DIFC Foundation</p>
              <p className="text-lg font-semibold text-white">
                {estate.assets.filter((a) => a.ownership.entity === 'DIFC_FOUNDATION').length} assets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-sm text-slate-400">Personal Name</p>
              <p className="text-lg font-semibold text-red-400">
                {estate.assets.filter((a) => a.ownership.entity === 'PERSONAL').length} assets
              </p>
              <p className="text-xs text-red-300 mt-1">Risk: Exposed to inheritance tax</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Corporate Entities</p>
              <p className="text-lg font-semibold text-white">
                {estate.assets.filter((a) => a.ownership.entity !== 'PERSONAL' && a.ownership.entity !== 'DIFC_FOUNDATION').length} assets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consolidation Simulator */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Consolidation Simulator</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Cash Injection Amount</label>
            <input
              type="number"
              value={cashInjection}
              onChange={(e) => setCashInjection(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="Enter cash injection"
            />
            <p className="text-xs text-slate-400 mt-1">
              Default: $200k User Loan + £850k Mymms Profit = {formatGBP(cashInjection)}
            </p>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Total Consolidation Cost</p>
              <p className="text-2xl font-bold text-amber-400">
                {formatGBP(consolidationScenario.totalConsolidationCost)}
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Remaining Cash</p>
              <p className="text-xl font-bold text-green-400">
                {formatGBP(consolidationScenario.remainingCash)}
              </p>
            </div>
          </div>
        </div>

        {/* Buyout Power Breakdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Ora House Buyout</p>
            <p className="text-lg font-bold text-white">
              {consolidationScenario.buyoutPower.oraHouse.canBuy ? '100%' : `${consolidationScenario.buyoutPower.oraHouse.percentage.toFixed(1)}%`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Cost: {formatGBP(consolidationScenario.buyoutPower.oraHouse.cost)}
            </p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Parekklisia Buyout</p>
            <p className="text-lg font-bold text-white">
              {consolidationScenario.buyoutPower.parekklisia.canBuy ? '100%' : `${consolidationScenario.buyoutPower.parekklisia.percentage.toFixed(1)}%`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Cost: {formatGBP(consolidationScenario.buyoutPower.parekklisia.cost)}
            </p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Hotel Buyout</p>
            <p className="text-lg font-bold text-white">
              {consolidationScenario.buyoutPower.hotel.canBuy ? '100%' : `${consolidationScenario.buyoutPower.hotel.percentage.toFixed(1)}%`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Cost: {formatGBP(consolidationScenario.buyoutPower.hotel.cost)}
            </p>
          </div>
        </div>

        {/* Interest Saved */}
        {consolidationScenario.interestSaved.annualSavings > 0 && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 font-medium mb-2">Interest Saved (Oakwood Clearance)</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400">Annual Savings</p>
                <p className="text-lg font-bold text-green-400">
                  {formatGBP(consolidationScenario.interestSaved.annualSavings)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Monthly Savings</p>
                <p className="text-lg font-bold text-green-400">
                  {formatGBP(consolidationScenario.interestSaved.monthlySavings)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Debt Cleared</p>
                <p className="text-lg font-bold text-white">
                  {formatGBP(consolidationScenario.interestSaved.oakwoodDebt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Cash Flow */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Global Cash Flow (The Salary)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-1">Hotel Lease</p>
            <p className="text-xl font-bold text-white">{formatGBP(cashFlow.monthlyIncome.hotelLease)}</p>
            <p className="text-xs text-slate-400 mt-1">Monthly</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-1">Car Park</p>
            <p className="text-xl font-bold text-white">{formatGBP(cashFlow.monthlyIncome.carPark)}</p>
            <p className="text-xs text-slate-400 mt-1">
              {eventModeActive ? 'Event Mode Active' : 'Normal Mode'}
            </p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-1">User Portfolio</p>
            <p className="text-xl font-bold text-white">
              {formatGBP(cashFlow.monthlyIncome.userPortfolio)}
            </p>
            <p className="text-xs text-slate-400 mt-1">8% Yield</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-slate-400 mb-1">Monthly Sovereign Salary</p>
            <p className="text-3xl font-bold text-green-400">
              {formatGBP(cashFlow.monthlySovereignSalary)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Annual: {formatGBP(cashFlow.annualProjection)}
            </p>
          </div>
        </div>
      </div>

      {/* Net Worth Projection Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Net Worth Projection (12 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={netWorthProjection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={2} name="Gross Value" />
            <Line type="monotone" dataKey="debt" stroke="#ef4444" strokeWidth={2} name="Total Debt" />
            <Line
              type="monotone"
              dataKey="dadEquity"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Dad's Equity"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Grid by Tier */}
      <div className="space-y-6">
        {/* S-Tier: Engine Assets */}
        {sTierAssets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Car className="w-6 h-6 text-amber-400" />
              S-Tier: Engine Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sTierAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        )}

        {/* A-Tier: Sovereign Assets */}
        {aTierAssets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              A-Tier: Sovereign Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aTierAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        )}

        {/* B-Tier: Liquidity Assets */}
        {bTierAssets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              B-Tier: Liquidity Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bTierAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        )}

        {/* C-Tier: Liability Assets */}
        {cTierAssets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-400" />
              C-Tier: Liability Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cTierAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

