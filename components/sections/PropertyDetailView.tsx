'use client'

import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { PropertyWithPayments } from '@/lib/portfolio-calculations'
import { formatGBP, formatPercentage } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface PropertyDetailViewProps {
  property: PropertyWithPayments
  onClose: () => void
}

export function PropertyDetailView({ property, onClose }: PropertyDetailViewProps) {
  const equity = property.purchasePrice - property.currentMortgageBalance
  const equityPercentage = (equity / property.purchasePrice) * 100
  const debtPercentage = property.ltv

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-bloomberg-panel border border-bloomberg-border rounded-lg m-4">
        {/* Header */}
        <div className="sticky top-0 bg-bloomberg-panel border-b border-bloomberg-border p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-bloomberg-text">{property.name}</h2>
            <p className="text-sm text-bloomberg-textMuted mt-1">{property.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bloomberg-darker rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-bloomberg-textMuted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* LTV Gauge */}
          <Card>
            <CardHeader>
              <CardTitle>Loan to Value (LTV) Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-8 bg-bloomberg-darker rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-bloomberg-success transition-all"
                    style={{ width: `${equityPercentage}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-bloomberg-danger transition-all"
                    style={{ width: `${debtPercentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-bloomberg-success rounded" />
                      <span className="text-sm text-bloomberg-textMuted">Equity</span>
                    </div>
                    <p className="text-lg font-bold text-bloomberg-success">
                      {formatGBP(equity)} ({formatPercentage(equityPercentage)})
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-bloomberg-danger rounded" />
                      <span className="text-sm text-bloomberg-textMuted">Debt</span>
                    </div>
                    <p className="text-lg font-bold text-bloomberg-danger">
                      {formatGBP(property.currentMortgageBalance)} ({formatPercentage(debtPercentage)})
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-bloomberg-textMuted">Monthly Rental Income</span>
                  <span className="text-lg font-semibold text-bloomberg-success">
                    {formatGBP(property.monthlyRentalIncome)}
                  </span>
                </div>

                <div className="border-t border-bloomberg-border pt-3 space-y-2">
                  <p className="text-sm font-semibold text-bloomberg-textMuted mb-2">Deductions:</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-bloomberg-textMuted">Mortgage Payment</span>
                    <span className="text-sm font-semibold text-bloomberg-text">
                      -{formatGBP(property.monthlyMortgagePayment)}
                    </span>
                  </div>

                  {property.maintenanceFee && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-bloomberg-textMuted">Maintenance Fee</span>
                      <span className="text-sm font-semibold text-bloomberg-text">
                        -{formatGBP(property.maintenanceFee)}
                      </span>
                    </div>
                  )}

                  {property.managementFee && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-bloomberg-textMuted">
                        Management Fee ({property.managementFee}%)
                      </span>
                      <span className="text-sm font-semibold text-bloomberg-text">
                        -{formatGBP((property.monthlyRentalIncome * property.managementFee) / 100)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-bloomberg-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-bloomberg-text">Net Profit</span>
                    <span
                      className={`text-xl font-bold flex items-center gap-2 ${
                        property.netProfit >= 0
                          ? 'text-bloomberg-success'
                          : 'text-bloomberg-danger'
                      }`}
                    >
                      {property.netProfit >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      {formatGBP(property.netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-bloomberg-textMuted">Purchase Price</span>
                  <span className="text-sm font-semibold text-bloomberg-text">
                    {formatGBP(property.purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-bloomberg-textMuted">Loan Type</span>
                  <span className={`text-sm font-semibold ${
                    property.loanType === 'variable' 
                      ? 'text-bloomberg-warning' 
                      : 'text-bloomberg-text'
                  }`}>
                    {property.loanType === 'variable' ? 'Variable (SONIA)' : 'Fixed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-bloomberg-textMuted">Interest Rate</span>
                  <span className="text-sm font-semibold text-bloomberg-text">
                    {formatPercentage(property.effectiveInterestRate)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cashflow Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-bloomberg-textMuted">Monthly Cashflow</span>
                  <span
                    className={`text-sm font-semibold ${
                      property.monthlyCashflow >= 0
                        ? 'text-bloomberg-success'
                        : 'text-bloomberg-danger'
                    }`}
                  >
                    {formatGBP(property.monthlyCashflow)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-bloomberg-textMuted">Annual Cashflow</span>
                  <span
                    className={`text-sm font-semibold ${
                      property.monthlyCashflow >= 0
                        ? 'text-bloomberg-success'
                        : 'text-bloomberg-danger'
                    }`}
                  >
                    {formatGBP(property.monthlyCashflow * 12)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-bloomberg-textMuted">Yield</span>
                  <span className="text-sm font-semibold text-bloomberg-text">
                    {formatPercentage(
                      (property.monthlyRentalIncome * 12 / property.purchasePrice) * 100
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

