'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutDashboard, Calculator, TrendingUp, TrendingDown } from 'lucide-react'
import SovereignDashboard from '@/components/sovereign/SovereignDashboard'
import DebtEquityCalculator from '@/components/sovereign/DebtEquityCalculator'
import ConsolidationRoadmapView from '@/components/sovereign/ConsolidationRoadmap'
import PruningModule from '@/components/sovereign/PruningModule'

export default function SovereignPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'consolidation' | 'pruning'>('dashboard')

  useEffect(() => {
    if (tabParam === 'consolidation') {
      setActiveTab('consolidation')
    } else if (tabParam === 'pruning') {
      setActiveTab('pruning')
    }
  }, [tabParam])

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Tabs */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Sovereign Ledger
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'calculator'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Calculator className="w-5 h-5" />
              Debt-for-Equity Swapper
            </button>
            <button
              onClick={() => setActiveTab('consolidation')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'consolidation'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Consolidation Roadmap
            </button>
            <button
              onClick={() => setActiveTab('pruning')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'pruning'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              Pruning Module
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <SovereignDashboard />}
        {activeTab === 'calculator' && <DebtEquityCalculator />}
        {activeTab === 'consolidation' && <ConsolidationRoadmapView />}
        {activeTab === 'pruning' && <PruningModule />}
      </div>
    </div>
  )
}

