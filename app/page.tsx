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

  // Convert assets to format expected by IHT calculator (simplified - just check personal assets)
  const personalAssets = assets.filter((a) => a.entity === 'Personal')
  const personalAssetsValue = personalAssets.reduce((sum, asset) => {
    const valueInGBP = asset.currency === 'GBP' ? asset.value : asset.value * 0.85
    return sum + valueInGBP
  }, 0)
  const ihtExposure = personalAssetsValue > 2_000_000

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
          {/* IHT Alert */}
          {ihtExposure && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-red-900">IHT Exposure Alert</span>
              </div>
              <p className="text-sm text-red-700">
                Personal assets exceed £2M threshold. Consider estate planning strategies.
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
              {/* Asset Register */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Asset Register</h2>
                <DynamicAssetTable assets={assets} onUpdateAsset={updateAsset} />
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <DebtMaturitySchedule assets={legacyAssets as any} />
                <OwnershipStructure
                  principalEquity={totals.principalEquity}
                  minorityEquity={totals.minorityEquity}
                  debt={totals.totalDebt}
                  totalValue={totals.totalGrossValue}
                />
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
