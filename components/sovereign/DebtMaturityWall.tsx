'use client'

import { useMemo } from 'react'
import { AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { useSovereignStore } from '@/lib/store/sovereign-store'
import { formatGBP } from '@/lib/utils'

export default function DebtMaturityWall() {
  const { liabilities, assets } = useSovereignStore()

  // Calculate DSCR (Debt Service Coverage Ratio)
  const calculateDSCR = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) return null

    const assetLiabilities = liabilities.filter((l) => l.asset_id === assetId)
    const totalDebtService = assetLiabilities.reduce((sum, l) => {
      if (l.monthly_payment) return sum + l.monthly_payment
      if (l.type === 'Interest Only' || l.type === 'Equity Release') {
        return sum + (l.amount * (l.rate / 100)) / 12
      }
      return sum + (l.amount * (l.rate / 100)) / 12 // Simplified
    }, 0)

    if (totalDebtService === 0) return null
    return asset.revenue_monthly / totalDebtService
  }

  // Group liabilities by maturity date
  const liabilitiesByMaturity = useMemo(() => {
    const now = new Date()
    const twelveMonths = new Date()
    twelveMonths.setMonth(twelveMonths.getMonth() + 12)

    const upcoming = liabilities.filter((l) => {
      const maturity = new Date(l.maturity_date)
      return maturity <= twelveMonths && maturity >= now
    })

    const future = liabilities.filter((l) => {
      const maturity = new Date(l.maturity_date)
      return maturity > twelveMonths
    })

    return { upcoming, future }
  }, [liabilities])

  const getAssetName = (assetId: string) => {
    return assets.find((a) => a.id === assetId)?.name || 'Unknown Asset'
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Debt Maturity Wall</h3>
        {liabilitiesByMaturity.upcoming.length > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {liabilitiesByMaturity.upcoming.length} maturing in next 12 months
            </span>
          </div>
        )}
      </div>

      {/* Upcoming Maturities (Red Alert) */}
      {liabilitiesByMaturity.upcoming.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-red-700 mb-3">⚠️ Upcoming Maturities</h4>
          <div className="space-y-2">
            {liabilitiesByMaturity.upcoming.map((liability) => {
              const maturity = new Date(liability.maturity_date)
              const daysUntil = Math.ceil((maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const dscr = calculateDSCR(liability.asset_id)

              return (
                <div
                  key={liability.id}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-red-900">{getAssetName(liability.asset_id)}</p>
                      <p className="text-sm text-red-700">{liability.lender}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-900">{formatGBP(liability.amount)}</p>
                      <p className="text-xs text-red-600">{liability.rate}% {liability.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-red-700">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {daysUntil} days until maturity
                      </span>
                    </div>
                    {dscr !== null && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-slate-600">
                          DSCR: {dscr.toFixed(2)}x
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Future Maturities */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Future Maturities</h4>
        <div className="space-y-2">
          {liabilitiesByMaturity.future.map((liability) => {
            const maturity = new Date(liability.maturity_date)
            const dscr = calculateDSCR(liability.asset_id)

            return (
              <div
                key={liability.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{getAssetName(liability.asset_id)}</p>
                    <p className="text-sm text-slate-600">{liability.lender}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatGBP(liability.amount)}</p>
                    <p className="text-xs text-slate-500">{liability.rate}% {liability.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">
                      {maturity.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {dscr !== null && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-slate-600" />
                      <span className="text-xs text-slate-600">
                        DSCR: {dscr.toFixed(2)}x
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

