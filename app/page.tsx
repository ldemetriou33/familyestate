'use client'

import { useState, useEffect } from 'react'
import { useSovereignStore } from '@/lib/store/sovereign-store'
import { seedSovereignData } from '@/lib/data/sovereign-relational-seed'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import KPIRibbon from '@/components/dashboard/KPIRibbon'
import EntityMap from '@/components/sovereign/EntityMap'
import DebtMaturityWall from '@/components/sovereign/DebtMaturityWall'
import EstateCopilot from '@/components/sovereign/EstateCopilot'
import DocumentVault from '@/components/sovereign/DocumentVault'
import OwnershipStructure from '@/components/dashboard/OwnershipStructure'
import RegulatoryTimer from '@/components/dashboard/RegulatoryTimer'
import { formatGBP } from '@/lib/utils'

type ViewType = 'overview' | 'entities' | 'assets' | 'financials' | 'ownership' | 'documents'

function DashboardContent() {
  const {
    entities,
    assets,
    liabilities,
    getTotalAUM,
    getPrincipalEquity,
    getMinorityEquity,
    getCashFlow,
    initialize
  } = useSovereignStore()
  const [view, setView] = useState<ViewType>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Initialize store with seed data on mount
  useEffect(() => {
    const seedData = seedSovereignData()
    initialize(seedData)
  }, [initialize])

  // Calculate totals from store
  const totalAUM = getTotalAUM()
  const principalEquity = getPrincipalEquity()
  const minorityEquity = getMinorityEquity()
  const totalDebt = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const ltv = totalAUM > 0 ? (totalDebt / totalAUM) * 100 : 0
  const cashFlow = getCashFlow()
  const cashFlowYTD = cashFlow.monthlyFreeCashFlow * 12

  // IHT exposure check (2026 BPR threshold: £2.5M per individual)
  // Calculate principal's business assets (corporate entities only)
  const businessEntities = entities.filter((e) => e.type === 'Corporate')
  const principalBusinessAssetsValue = businessEntities.reduce((sum, entity) => {
    const entityAssets = assets.filter((a) => a.entity_id === entity.id)
    const dadShare = entity.shareholders.find((s) => s.name === 'Dad')?.percentage || 0
    
    return entityAssets.reduce((entitySum, asset) => {
      const assetLiabilities = liabilities.filter((l) => l.asset_id === asset.id)
      const assetDebt = assetLiabilities.reduce((debtSum, l) => debtSum + l.amount, 0)
      const netValue = asset.valuation - assetDebt
      return entitySum + (netValue * dadShare) / 100
    }, sum)
  }, 0)
  
  const ihtThreshold = 2_500_000 // £2.5M BPR cap
  const ihtExposure = principalBusinessAssetsValue > ihtThreshold
  const ihtExcess = Math.max(0, principalBusinessAssetsValue - ihtThreshold)
  const ihtEstimatedTax = ihtExcess * 0.2

  const handleNavigate = (viewName: ViewType) => {
    setView(viewName)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar
        onNavigate={handleNavigate}
        currentView={view}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          {/* IHT Alert */}
          {ihtExposure && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-red-900">IHT Exposure Alert</span>
              </div>
              <p className="text-sm text-red-700">
                Business assets exceed £2.5M threshold by {formatGBP(ihtExcess)}. Estimated tax at 20%
                effective rate: {formatGBP(ihtEstimatedTax)}.
              </p>
            </div>
          )}

          {/* KPI Ribbon */}
          <KPIRibbon aum={totalAUM} nav={principalEquity} ltv={ltv} cashFlowYTD={cashFlowYTD} />

          {/* View Content */}
          {view === 'overview' && (
            <div className="space-y-6">
              {/* Entity Map - Primary Navigation */}
              <EntityMap />

              {/* Financial Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DebtMaturityWall />
                <OwnershipStructure
                  principalEquity={principalEquity}
                  minorityEquity={minorityEquity}
                  debt={totalDebt}
                  totalValue={totalAUM}
                />
              </div>

              {/* Regulatory/Tax Timers */}
              <RegulatoryTimer />
            </div>
          )}

          {view === 'entities' && (
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-3 lg:mb-4">Entity Structure</h2>
              <EntityMap />
            </div>
          )}

          {view === 'financials' && (
            <div className="space-y-4 lg:space-y-6">
              <h2 className="text-lg lg:text-xl font-semibold text-slate-900">Financial Overview</h2>
              <DebtMaturityWall />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">Monthly Income</p>
                  <p className="text-2xl font-bold text-slate-900">{formatGBP(cashFlow.monthlyIncome)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">Monthly Debt Payments</p>
                  <p className="text-2xl font-bold text-slate-900">{formatGBP(cashFlow.monthlyDebtPayments)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">Free Cash Flow</p>
                  <p className="text-2xl font-bold text-slate-900">{formatGBP(cashFlow.monthlyFreeCashFlow)}</p>
                </div>
              </div>
            </div>
          )}

          {view === 'ownership' && (
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-3 lg:mb-4">Ownership Structure</h2>
              <OwnershipStructure
                principalEquity={principalEquity}
                minorityEquity={minorityEquity}
                debt={totalDebt}
                totalValue={totalAUM}
              />
            </div>
          )}

          {view === 'documents' && (
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-3 lg:mb-4">Document Vault</h2>
              <DocumentVault />
            </div>
          )}

          {/* Estate Copilot - Floating Widget */}
          <EstateCopilot />
        </main>
      </div>
    </div>
  )
}

export default function HomePage() {
  return <DashboardContent />
}

export const dynamic = 'force-dynamic'
