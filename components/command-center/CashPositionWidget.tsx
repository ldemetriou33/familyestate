'use client'

import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP } from '@/lib/utils'
import { CashPosition } from '@/lib/types/abbey-os'

interface CashPositionWidgetProps {
  cashPosition: CashPosition
}

export function CashPositionWidget({ cashPosition }: CashPositionWidgetProps) {
  const totalBalance = cashPosition.operatingBalance + cashPosition.reserveBalance
  const netFlow = cashPosition.inflows - cashPosition.outflows
  const isPositiveFlow = netFlow >= 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="w-5 h-5 text-bloomberg-accent" />
          Cash Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Balance */}
        <div>
          <p className="text-xs text-bloomberg-textMuted mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-bloomberg-text">{formatGBP(totalBalance)}</p>
        </div>

        {/* Operating vs Reserve */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-bloomberg-darker rounded-lg">
            <p className="text-xs text-bloomberg-textMuted mb-1">Operating</p>
            <p className="text-lg font-semibold text-bloomberg-text">
              {formatGBP(cashPosition.operatingBalance)}
            </p>
          </div>
          <div className="p-3 bg-bloomberg-darker rounded-lg">
            <p className="text-xs text-bloomberg-textMuted mb-1">Reserve</p>
            <p className="text-lg font-semibold text-bloomberg-text">
              {formatGBP(cashPosition.reserveBalance)}
            </p>
          </div>
        </div>

        {/* Today&apos;s Movement */}
        <div className="pt-3 border-t border-bloomberg-border">
          <p className="text-xs text-bloomberg-textMuted mb-2">Today&apos;s Movement</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-bloomberg-success" />
              <span className="text-sm text-bloomberg-success">{formatGBP(cashPosition.inflows)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-bloomberg-danger" />
              <span className="text-sm text-bloomberg-danger">{formatGBP(cashPosition.outflows)}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${
              isPositiveFlow ? 'bg-bloomberg-success/10' : 'bg-bloomberg-danger/10'
            }`}>
              {isPositiveFlow ? (
                <TrendingUp className="w-4 h-4 text-bloomberg-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-bloomberg-danger" />
              )}
              <span className={`text-sm font-semibold ${
                isPositiveFlow ? 'text-bloomberg-success' : 'text-bloomberg-danger'
              }`}>
                {isPositiveFlow ? '+' : ''}{formatGBP(netFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Projections */}
        {(cashPosition.projected30Day || cashPosition.projected90Day) && (
          <div className="pt-3 border-t border-bloomberg-border">
            <p className="text-xs text-bloomberg-textMuted mb-2">Projected Balance</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-bloomberg-textMuted">30 Days:</span>
              <span className="font-semibold text-bloomberg-text">
                {formatGBP(cashPosition.projected30Day || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-bloomberg-textMuted">90 Days:</span>
              <span className="font-semibold text-bloomberg-text">
                {formatGBP(cashPosition.projected90Day || 0)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

