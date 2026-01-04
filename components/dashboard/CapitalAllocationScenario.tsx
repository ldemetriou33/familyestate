'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { runConsolidationScenario } from '@/lib/logic/consolidation'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'
import { formatGBP } from '@/lib/utils'

interface CapitalAllocationScenarioProps {
  assets: SovereignAsset[]
}

export default function CapitalAllocationScenario({ assets }: CapitalAllocationScenarioProps) {
  const [cashInjection, setCashInjection] = useState(1_050_000)
  const [loanAmount, setLoanAmount] = useState(0)

  const scenario = runConsolidationScenario(assets, cashInjection + loanAmount)

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Capital Allocation Scenario</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cash Injection
          </label>
          <input
            type="number"
            value={cashInjection}
            onChange={(e) => setCashInjection(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Loan Amount
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Post-Transaction Ownership</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Ora House</span>
            <span className="text-sm font-medium text-slate-900">
              {scenario.buyoutPower.oraHouse.canBuy
                ? '100%'
                : `${(33 + scenario.buyoutPower.oraHouse.percentage).toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Parekklisia Land</span>
            <span className="text-sm font-medium text-slate-900">
              {scenario.buyoutPower.parekklisia.canBuy
                ? '100%'
                : `${(33 + scenario.buyoutPower.parekklisia.percentage).toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Abbey Point Hotel</span>
            <span className="text-sm font-medium text-slate-900">
              {scenario.buyoutPower.hotel.canBuy
                ? '100%'
                : `${(33 + scenario.buyoutPower.hotel.percentage).toFixed(1)}%`}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Total Cost</span>
            <span className="text-sm font-semibold text-slate-900">
              {formatGBP(scenario.totalConsolidationCost)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-slate-700">Remaining Cash</span>
            <span className="text-sm font-semibold text-slate-900">
              {formatGBP(scenario.remainingCash)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

