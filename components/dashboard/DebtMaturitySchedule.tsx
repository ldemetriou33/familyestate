'use client'

import { Calendar, Percent, DollarSign } from 'lucide-react'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'
import { formatGBP, formatEUR } from '@/lib/utils'

interface DebtMaturityScheduleProps {
  assets: SovereignAsset[]
}

export default function DebtMaturitySchedule({ assets }: DebtMaturityScheduleProps) {
  const debts = assets
    .filter((asset) => asset.debt)
    .map((asset) => ({
      assetName: asset.name,
      principal: asset.debt!.principal,
      interestRate: asset.debt!.interestRate,
      type: asset.debt!.type,
      currency: asset.currency,
      isCompound: asset.debt!.isCompound,
    }))

  const formatCurrency = (currency: 'GBP' | 'EUR') =>
    currency === 'GBP' ? formatGBP : formatEUR

  if (debts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Debt Maturity Schedule</h3>
        <p className="text-sm text-slate-500">No outstanding debt</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Debt Maturity Schedule</h3>
      <div className="space-y-4">
        {debts.map((debt, index) => (
          <div
            key={index}
            className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{debt.assetName}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {debt.type === 'FIXED' ? 'Fixed Rate' : debt.type === 'VARIABLE' ? 'Variable Rate' : 'Equity Release'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(debt.currency)(debt.principal)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-600">{debt.interestRate}%</span>
              </div>
              {debt.isCompound && (
                <span className="text-xs text-red-600 font-medium">Compounding</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

