'use client'

import { DollarSign, TrendingUp, Percent, Calendar } from 'lucide-react'
import { formatGBP } from '@/lib/utils'

interface KPIRibbonProps {
  aum: number // Assets Under Management
  nav: number // Net Asset Value (Principal's Equity)
  ltv: number // Loan-to-Value ratio (percentage)
  cashFlowYTD: number // Year-to-date cash flow
}

export default function KPIRibbon({ aum, nav, ltv, cashFlowYTD }: KPIRibbonProps) {
  const kpis = [
    {
      label: 'AUM',
      value: formatGBP(aum),
      subtitle: 'Assets Under Management',
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      label: 'Net Asset Value',
      value: formatGBP(nav),
      subtitle: "Principal's Equity",
      icon: TrendingUp,
      color: 'text-slate-700',
    },
    {
      label: 'Leverage (LTV)',
      value: `${ltv.toFixed(1)}%`,
      subtitle: 'Total Debt / Gross Value',
      icon: Percent,
      color: 'text-slate-700',
    },
    {
      label: 'Cash Flow (YTD)',
      value: formatGBP(cashFlowYTD),
      subtitle: 'Projected',
      icon: Calendar,
      color: 'text-slate-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
              <Icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</p>
            <p className="text-xs text-slate-400">{kpi.subtitle}</p>
          </div>
        )
      })}
    </div>
  )
}

