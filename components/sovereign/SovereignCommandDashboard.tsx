'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Car, Shield } from 'lucide-react'
import { seedSovereignEstate, type SovereignEstate } from '@/lib/data/sovereign-seed'
import { runConsolidationScenario } from '@/lib/logic/consolidation'
import { calculateGlobalCashFlow, DEFAULT_CASH_FLOW_INPUTS } from '@/lib/logic/cash-flow'
import { useWembleyEvents } from '@/lib/hooks/useWembleyEvents'
import { formatGBP } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import EquityBar from '@/components/dashboard/EquityBar'
import ConsolidationSlider from '@/components/dashboard/ConsolidationSlider'
import VaultStatus from '@/components/dashboard/VaultStatus'
import AssetBentoGrid from '@/components/dashboard/AssetBentoGrid'

export default function SovereignCommandDashboard() {
  const [estate, setEstate] = useState<SovereignEstate | null>(null)
  const [cashInjection, setCashInjection] = useState(1_050_000) // $200k + £850k Mymms
  const [consolidationScenario, setConsolidationScenario] = useState<any>(null)
  const [cashFlow, setCashFlow] = useState<any>(null)
  const [eventModeActive, setEventModeActive] = useState(false)
  const { events, eventModeActive: wembleyEventActive, calculateMonthlyRevenue } = useWembleyEvents()

  useEffect(() => {
    const estateData = seedSovereignEstate()
    setEstate(estateData)

    // Calculate consolidation scenario immediately
    try {
      const scenario = runConsolidationScenario(estateData.assets, cashInjection)
      setConsolidationScenario(scenario)
    } catch (error) {
      console.error('Error calculating consolidation scenario:', error)
    }

    // Calculate cash flow
    const carParkAsset = estateData.assets.find((a) => a.id === 'wembley-car-park')
    const carParkNormal = DEFAULT_CASH_FLOW_INPUTS.carParkNormal
    
    // Calculate car park event revenue
    let carParkEvent = 0
    if (carParkAsset?.metadata.spaces && calculateMonthlyRevenue) {
      try {
        carParkEvent = calculateMonthlyRevenue(
          20, // Normal daily rate per space
          50, // Event rate per space
          carParkAsset.metadata.spaces
        )
      } catch (error) {
        console.error('Error calculating monthly revenue:', error)
        carParkEvent = carParkNormal // Fallback
      }
    } else {
      carParkEvent = carParkNormal // Fallback
    }

    const flow = calculateGlobalCashFlow({
      ...DEFAULT_CASH_FLOW_INPUTS,
      carParkEvent: carParkEvent - carParkNormal, // Additional event revenue
    })
    setCashFlow(flow)
  }, [calculateMonthlyRevenue, cashInjection])

  const handleScenarioChange = (scenario: any) => {
    setConsolidationScenario(scenario)
  }

  const handleCashInjectionChange = (newValue: number) => {
    setCashInjection(newValue)
  }

  const handleEventModeToggle = (assetId: string) => {
    if (assetId === 'wembley-car-park') {
      setEventModeActive(!eventModeActive)
    }
  }

  if (!estate || !consolidationScenario || !cashFlow) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const allAssets = estate.assets

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
    <div className="min-h-screen bg-zinc-950 p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">Sovereign Command Center</h1>
          <p className="text-zinc-400">Single Family Office - Asset Orchestration</p>
        </div>
        {wembleyEventActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg"
          >
            <Car className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Wembley Event Mode Active</span>
          </motion.div>
        )}
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Row 1: Equity Bar (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-12 bg-zinc-900 rounded-xl border border-zinc-800 p-6"
        >
          <EquityBar
            totalGrossValue={estate.totalGrossValue}
            totalDebt={estate.totalDebt}
            dadEquity={estate.dadEquity}
            unclesEquity={estate.unclesEquity}
          />
        </motion.div>

        {/* Row 2: Consolidation Simulator (Left) + Vault Status (Right) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 bg-zinc-900 rounded-xl border border-zinc-800 p-6"
        >
          {estate && estate.assets.length > 0 && (
            <ConsolidationSlider
              assets={estate.assets}
              initialCashInjection={cashInjection}
              onScenarioChange={handleScenarioChange}
              onCashInjectionChange={handleCashInjectionChange}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 bg-zinc-900 rounded-xl border border-zinc-800 p-6"
        >
          <VaultStatus assets={estate.assets} />
        </motion.div>

        {/* Row 3: Global Cash Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-12 bg-zinc-900 rounded-xl border border-zinc-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-zinc-100">Global Cash Flow (The Salary)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-400 mb-1">Hotel Lease</p>
              <p className="text-xl font-bold text-zinc-100">{formatGBP(cashFlow.monthlyIncome.hotelLease)}</p>
              <p className="text-xs text-zinc-500 mt-1">Monthly</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-400 mb-1">Car Park</p>
              <p className="text-xl font-bold text-zinc-100">{formatGBP(cashFlow.monthlyIncome.carPark)}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {eventModeActive ? 'Event Mode Active' : 'Normal Mode'}
              </p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-400 mb-1">User Portfolio</p>
              <p className="text-xl font-bold text-zinc-100">
                {formatGBP(cashFlow.monthlyIncome.userPortfolio)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">8% Yield</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/30 rounded-lg">
              <p className="text-sm text-zinc-400 mb-1">Monthly Sovereign Salary</p>
              <p className="text-3xl font-bold text-emerald-400">
                {formatGBP(cashFlow.monthlySovereignSalary)}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Annual: {formatGBP(cashFlow.annualProjection)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Row 4: Net Worth Projection Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-12 bg-zinc-900 rounded-xl border border-zinc-800 p-6"
        >
          <h2 className="text-xl font-bold text-zinc-100 mb-4">Net Worth Projection (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={netWorthProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5',
                }}
              />
              <Line
                type="monotone"
                dataKey="gross"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Gross Value"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="debt"
                stroke="#f43f5e"
                strokeWidth={2}
                name="Total Debt"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="dadEquity"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Dad's Equity"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Row 5: Asset Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-zinc-100">Asset Portfolio</h2>
          </div>
          <AssetBentoGrid
            assets={allAssets}
            eventModeActive={eventModeActive}
            onEventModeToggle={handleEventModeToggle}
          />
        </motion.div>
      </div>
    </div>
  )
}

