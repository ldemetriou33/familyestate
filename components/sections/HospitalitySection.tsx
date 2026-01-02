'use client'

import { Hotel, Users, TrendingUp, DollarSign, Percent, Building2 } from 'lucide-react'
import { hotel } from '@/lib/constants'
import { formatGBP, formatPercentage } from '@/lib/utils'
import { calculateMonthlyMortgagePayment } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function HospitalitySection() {
  // Calculate hotel metrics
  const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
    hotel.currentMortgageBalance,
    hotel.currentInterestRate,
    25
  )
  const monthlyCashflow = hotel.monthlyRentalIncome - monthlyMortgagePayment
  const ltv = (hotel.currentMortgageBalance / hotel.purchasePrice) * 100
  const occupancyRate = 87.3 // Estimated occupancy rate
  const activeGuests = 1247 // Estimated active guests

  const metrics = [
    {
      label: 'Monthly Revenue',
      value: formatGBP(hotel.monthlyRentalIncome),
      description: 'Hotel Revenue',
      icon: DollarSign,
      trend: 'up',
    },
    {
      label: 'Occupancy Rate',
      value: formatPercentage(occupancyRate),
      description: 'Current Occupancy',
      icon: TrendingUp,
      trend: 'up',
    },
    {
      label: 'Monthly Cashflow',
      value: formatGBP(monthlyCashflow),
      description: 'Revenue - Mortgage',
      icon: DollarSign,
      trend: monthlyCashflow >= 0 ? 'up' : 'down',
    },
    {
      label: 'Active Guests',
      value: activeGuests.toLocaleString(),
      description: 'Current Guests',
      icon: Users,
      trend: 'up',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const isPositive = metric.trend === 'up'
          
          return (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isPositive ? 'text-bloomberg-success' : 'text-bloomberg-danger'
                    }`}
                  />
                </div>
                <p className="text-sm text-bloomberg-textMuted mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-bloomberg-text mb-1">{metric.value}</p>
                <p className="text-xs text-bloomberg-textMuted">{metric.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-bloomberg-accent" />
              {hotel.name}
            </CardTitle>
            <p className="text-sm text-bloomberg-textMuted mt-1">{hotel.location}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-bloomberg-textMuted mb-1">Purchase Price</p>
                <p className="text-sm font-semibold text-bloomberg-text">
                  {formatGBP(hotel.purchasePrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-bloomberg-textMuted mb-1">Mortgage Balance</p>
                <p className="text-sm font-semibold text-bloomberg-text">
                  {formatGBP(hotel.currentMortgageBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-bloomberg-textMuted mb-1">LTV</p>
                <p className="text-sm font-semibold text-bloomberg-text">
                  {formatPercentage(ltv)}
                </p>
              </div>
              <div>
                <p className="text-xs text-bloomberg-textMuted mb-1">Interest Rate</p>
                <p className="text-sm font-semibold text-bloomberg-text">
                  {formatPercentage(hotel.currentInterestRate)}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-bloomberg-border space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-bloomberg-textMuted">Monthly Revenue</span>
                <span className="text-sm font-semibold text-bloomberg-success">
                  {formatGBP(hotel.monthlyRentalIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-bloomberg-textMuted">Monthly Mortgage Payment</span>
                <span className="text-sm font-semibold text-bloomberg-text">
                  {formatGBP(monthlyMortgagePayment)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-bloomberg-border">
                <span className="text-sm font-semibold text-bloomberg-text">Net Monthly Cashflow</span>
                <span
                  className={`text-sm font-bold ${
                    monthlyCashflow >= 0
                      ? 'text-bloomberg-success'
                      : 'text-bloomberg-danger'
                  }`}
                >
                  {formatGBP(monthlyCashflow)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="w-5 h-5 text-bloomberg-accent" />
              Hotel Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-bloomberg-textMuted">Occupancy Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-bloomberg-darker rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bloomberg-success rounded-full"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-bloomberg-text w-16 text-right">
                    {formatPercentage(occupancyRate)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-bloomberg-textMuted">Active Guests</span>
                <span className="text-sm font-semibold text-bloomberg-text">
                  {activeGuests.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-bloomberg-textMuted">Average Daily Rate</span>
                <span className="text-sm font-semibold text-bloomberg-text">
                  {formatGBP(Math.round(hotel.monthlyRentalIncome / 30 / (activeGuests / 30)))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

