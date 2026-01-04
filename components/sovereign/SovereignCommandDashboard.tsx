'use client'

import { useState, useEffect } from 'react'
import { seedSovereignEstate, type SovereignEstate } from '@/lib/data/sovereign-seed'
import { calculateGlobalCashFlow, DEFAULT_CASH_FLOW_INPUTS } from '@/lib/logic/cash-flow'
import { calculateIHTExposure } from '@/lib/logic/iht-calculator'
import { useWembleyEvents } from '@/lib/hooks/useWembleyEvents'
import { formatGBP } from '@/lib/utils'
import KPIRibbon from '@/components/dashboard/KPIRibbon'
import AssetTable from '@/components/dashboard/AssetTable'
import DebtMaturitySchedule from '@/components/dashboard/DebtMaturitySchedule'
import OwnershipStructure from '@/components/dashboard/OwnershipStructure'
import CapitalAllocationScenario from '@/components/dashboard/CapitalAllocationScenario'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export default function SovereignCommandDashboard() {
  const [estate, setEstate] = useState<SovereignEstate | null>(null)
  const [cashFlow, setCashFlow] = useState<any>(null)
  const { calculateMonthlyRevenue } = useWembleyEvents()

  useEffect(() => {
    const estateData = seedSovereignEstate()
    setEstate(estateData)

    // Calculate cash flow
    const carParkAsset = estateData.assets.find((a) => a.id === 'wembley-car-park')
    const carParkNormal = DEFAULT_CASH_FLOW_INPUTS.carParkNormal
    
    // Calculate car park event revenue
    let carParkEvent = carParkNormal
    if (carParkAsset?.metadata.spaces && calculateMonthlyRevenue) {
      try {
        carParkEvent = calculateMonthlyRevenue(
          20, // Normal daily rate per space
          50, // Event rate per space
          carParkAsset.metadata.spaces
        )
      } catch (error) {
        console.error('Error calculating monthly revenue:', error)
      }
    }

    const flow = calculateGlobalCashFlow({
      ...DEFAULT_CASH_FLOW_INPUTS,
      carParkEvent: carParkEvent - carParkNormal, // Additional event revenue
    })
    setCashFlow(flow)
  }, [calculateMonthlyRevenue])

  if (!estate || !cashFlow) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate KPIs
  const aum = estate.totalGrossValue
  const nav = estate.dadEquity // Principal's equity
  const ltv = (estate.totalDebt / estate.totalGrossValue) * 100
  const cashFlowYTD = cashFlow.monthlySovereignSalary * 12 // Projected annual

  // Check for IHT exposure
  const ihtExposure = calculateIHTExposure(estate.assets)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="ml-64">
        <DashboardHeader />
        <main className="p-6">
          {/* IHT Alert */}
          {ihtExposure.isExposed && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-red-900">
                  IHT Exposure Alert
                </span>
              </div>
              <p className="text-sm text-red-700">
                Personal assets exceed £2M threshold by {formatGBP(ihtExposure.excess)}.
                Estimated tax at 20% effective rate: {formatGBP(ihtExposure.estimatedTax)}.
              </p>
            </div>
          )}

          {/* KPI Ribbon */}
          <KPIRibbon aum={aum} nav={nav} ltv={ltv} cashFlowYTD={cashFlowYTD} />

          {/* Asset Register */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Asset Register</h2>
            <AssetTable assets={estate.assets} />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DebtMaturitySchedule assets={estate.assets} />
            <OwnershipStructure
              principalEquity={estate.dadEquity}
              minorityEquity={estate.unclesEquity}
              debt={estate.totalDebt}
              totalValue={estate.totalGrossValue}
            />
          </div>

          {/* Capital Allocation Scenario */}
          <div className="mb-6">
            <CapitalAllocationScenario assets={estate.assets} />
          </div>
        </main>
      </div>
    </div>
  )
}
