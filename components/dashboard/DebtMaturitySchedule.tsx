'use client'

import { AlertCircle, Percent } from 'lucide-react'
import { formatGBP } from '@/lib/utils'
import type { EstateAsset } from '@/lib/types/estate-state'

interface DebtMaturityScheduleProps {
  assets: EstateAsset[]
}

export default function DebtMaturitySchedule({ assets }: DebtMaturityScheduleProps) {
  // Filter assets with debt and include interest rate information
  const debts = assets
    .filter((asset) => asset.debt > 0)
    .map((asset) => {
      // Convert to GBP for display
      const debtInGBP = asset.currency === 'GBP' ? asset.debt : asset.debt * 0.85
      const rate = asset.interest_rate || 5.5
      const monthlyPayment = asset.monthly_payment || (asset.debt > 0 ? (debtInGBP * (rate / 100)) / 12 : 0)
      
      return {
        name: asset.name,
        amount: debtInGBP,
        currency: 'GBP',
        status: asset.status,
        interestRate: rate,
        monthlyPayment,
        hasActualPayment: !!asset.monthly_payment,
        isCompounding: asset.id === 'oakwood-close', // Oakwood Close compounds interest
      }
    })
    .sort((a, b) => b.amount - a.amount)

  if (debts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Debt Maturity Schedule</h3>
        <p className="text-sm text-slate-500">No outstanding debts</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Debt Maturity Schedule</h3>
      <div className="space-y-3">
        {debts.map((debt, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{debt.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {formatGBP(debt.amount)} • {debt.interestRate.toFixed(1)}% Rate
              </p>
              {debt.hasActualPayment && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Payment: {formatGBP(debt.monthlyPayment)}/mo
                </p>
              )}
              {debt.isCompounding && (
                <p className="text-xs text-amber-600 mt-0.5 font-medium">
                  Compounding Interest (No Payment)
                </p>
              )}
            </div>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
        ))}
      </div>
    </div>
  )
}
