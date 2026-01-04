'use client'

import { useState } from 'react'
import { EstateProvider, useEstateContext } from '@/contexts/EstateContext'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import KPIRibbon from '@/components/dashboard/KPIRibbon'
import DynamicAssetTable from '@/components/dashboard/DynamicAssetTable'
import DebtMaturitySchedule from '@/components/dashboard/DebtMaturitySchedule'
import OwnershipStructure from '@/components/dashboard/OwnershipStructure'
import CapitalAllocationScenario from '@/components/dashboard/CapitalAllocationScenario'
import { formatGBP } from '@/lib/utils'
import { calculateIHTExposure } from '@/lib/logic/iht-calculator'

type ViewType = 'overview' | 'assets' | 'financials' | 'ownership' | 'calculator'

function DashboardContent() {
  const { assets, updateAsset, totals, currency } = useEstateContext()
  const [view, setView] = useState<ViewType>('overview')

  // IHT exposure check (2026 BPR threshold: £2.5M per individual)
  // Calculate principal's business assets (excluding personal assets)
  const businessAssets = assets.filter((a) => a.entity !== 'Personal')
  const principalBusinessAssetsValue = businessAssets.reduce((sum, asset) => {
    const valueInGBP = asset.currency === 'GBP' ? asset.value : asset.value * 0.85
    const netValue = valueInGBP - (asset.currency === 'GBP' ? asset.debt : asset.debt * 0.85)
    const principalEquity = (netValue * asset.owner_dad_pct) / 100
    return sum + principalEquity
  }, 0)
  const ihtThreshold = 2_500_000 // £2.5M BPR cap
  const ihtExposure = principalBusinessAssetsValue > ihtThreshold
  const ihtExcess = Math.max(0, principalBusinessAssetsValue - ihtThreshold)
  const ihtEstimatedTax = ihtExcess * 0.2

  // Calculate cash flow (simplified - project from assets)
  const cashFlowYTD = totals.principalEquity * 0.05 // 5% yield estimate

  const handleNavigate = (viewName: ViewType) => {
    setView(viewName)
  }

  // Convert assets format for legacy components (temporary adapter)
  const legacyAssets = assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    tier: asset.tier === 'Core' ? 'S' : asset.tier === 'Value-Add' ? 'B' : 'C',
    location: asset.location.includes('UK') ? 'UK' : 'CYPRUS',
    currency: asset.currency,
    valuation: asset.value,
    debt: asset.debt > 0
      ? {
          principal: asset.debt,
          interestRate: 5.5,
          type: 'FIXED' as const,
          isCompound: false,
        }
      : undefined,
    ownership: {
      dad: asset.owner_dad_pct,
      uncles: asset.owner_uncle_pct,
      entity: asset.entity || 'MAD_LTD',
    },
    status: asset.status,
    metadata: asset.metadata || {},
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar currentView={view} onNavigate={handleNavigate} />
      <div className="ml-64">
        <DashboardHeader />
        <main className="p-6">
          {/* IHT Status */}
          {ihtExposure ? (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-red-900">IHT Exposure Alert</span>
              </div>
              <p className="text-sm text-red-700">
                Principal business assets exceed £2.5M BPR cap by {formatGBP(ihtExcess)}. Estimated
                tax at 20% effective rate: {formatGBP(ihtEstimatedTax)}.
              </p>
            </div>
          ) : (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-green-900">IHT Status: Safe (Within Cap)</span>
              </div>
              <p className="text-sm text-green-700">
                Principal business assets: {formatGBP(principalBusinessAssetsValue)} / {formatGBP(ihtThreshold)} BPR cap.
              </p>
            </div>
          )}

          {/* KPI Ribbon - Always visible */}
          <KPIRibbon
            aum={totals.totalGrossValue}
            nav={totals.principalEquity}
            ltv={totals.ltv}
            cashFlowYTD={cashFlowYTD}
          />

          {/* View Content */}
          {view === 'overview' && (
            <>
              {/* Financial Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <OwnershipStructure
                  principalEquity={totals.principalEquity}
                  minorityEquity={totals.minorityEquity}
                  debt={totals.totalDebt}
                  totalValue={totals.totalGrossValue}
                />
                <DebtMaturitySchedule assets={legacyAssets as any} />
              </div>

              {/* Regulatory/Tax Timers */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Regulatory Timeline</h2>
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <RegulatoryTimer compact={false} />
                </div>
              </div>
            </>
          )}

          {view === 'assets' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Asset Register</h2>
              <DynamicAssetTable assets={assets} onUpdateAsset={updateAsset} />
            </div>
          )}

          {view === 'financials' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <DebtMaturitySchedule assets={legacyAssets as any} />
              <OwnershipStructure
                principalEquity={totals.principalEquity}
                minorityEquity={totals.minorityEquity}
                debt={totals.totalDebt}
                totalValue={totals.totalGrossValue}
              />
            </div>
          )}

          {view === 'ownership' && (
            <div className="mb-6">
              <OwnershipStructure
                principalEquity={totals.principalEquity}
                minorityEquity={totals.minorityEquity}
                debt={totals.totalDebt}
                totalValue={totals.totalGrossValue}
              />
            </div>
          )}

          {view === 'calculator' && (
            <div className="mb-6">
              <CapitalAllocationScenario assets={legacyAssets as any} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <EstateProvider>
      <DashboardContent />
    </EstateProvider>
  )
}
