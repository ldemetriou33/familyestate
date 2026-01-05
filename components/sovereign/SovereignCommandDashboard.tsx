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
import type { EstateAsset } from '@/lib/types/estate-state'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'

/**
 * Convert SovereignAsset to EstateAsset format for DebtMaturitySchedule
 */
function convertSovereignToEstateAsset(asset: SovereignAsset): EstateAsset {
  const debt = asset.debt?.principal || 0
  const interestRate = asset.debt?.interestRate || 5.5
  
  // Map entity types
  let entity: 'MAD Ltd' | 'Dem Bro Ltd' | 'Personal (Dad)' | 'Grandma' = 'Personal (Dad)'
  if (asset.ownership.entity === 'MAD_LTD') entity = 'MAD Ltd'
  else if (asset.ownership.entity === 'DEM_BRO_LTD') entity = 'Dem Bro Ltd'
  else if (asset.ownership.entity === 'PERSONAL') entity = 'Personal (Dad)'
  
  // Map status
  let status: 'Leased' | 'Renovation' | 'Strategic Hold' | 'For Sale' | 'OPERATIONAL' = 'OPERATIONAL'
  if (asset.status === 'LEASED') status = 'Leased'
  else if (asset.status === 'RENOVATION') status = 'Renovation'
  else if (asset.status === 'STRATEGIC_HOLD') status = 'Strategic Hold'
  else if (asset.status === 'PRUNE') status = 'For Sale'
  
  // Map tier
  let tier: 'Core' | 'Value-Add' | 'Opportunistic' = 'Core'
  if (asset.tier === 'S' || asset.tier === 'A') tier = 'Core'
  else if (asset.tier === 'B') tier = 'Value-Add'
  else tier = 'Opportunistic'
  
  return {
    id: asset.id,
    name: asset.name,
    value: asset.valuation,
    debt,
    owner_dad_pct: asset.ownership.dad,
    owner_uncle_pct: asset.ownership.uncles,
    status,
    tier,
    currency: asset.currency,
    location: asset.location === 'UK' ? `${asset.location}` : asset.location,
    entity,
    interest_rate: interestRate,
    metadata: asset.metadata,
  }
}

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

          {/* Global Cash Flow */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Global Cash Flow</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Hotel Lease (NNN)</p>
                <p className="text-xl font-bold text-slate-900">{formatGBP(cashFlow.monthlyIncome.hotelLease)}</p>
                <p className="text-xs text-slate-400 mt-1">Monthly</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Cafe Royal</p>
                <p className="text-xl font-bold text-slate-900">{formatGBP(cashFlow.monthlyIncome.cafeRoyal)}</p>
                <p className="text-xs text-slate-400 mt-1">Monthly</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Car Park</p>
                <p className="text-xl font-bold text-slate-900">{formatGBP(cashFlow.monthlyIncome.carPark)}</p>
                <p className="text-xs text-slate-400 mt-1">Normal Mode</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">User Portfolio</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatGBP(cashFlow.monthlyIncome.userPortfolio)}
                </p>
                <p className="text-xs text-slate-400 mt-1">8% Yield</p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-1 font-medium">Monthly Net Income</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatGBP(cashFlow.monthlySovereignSalary)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Annual: {formatGBP(cashFlow.annualProjection)}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DebtMaturitySchedule assets={estate.assets.map(convertSovereignToEstateAsset)} />
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
