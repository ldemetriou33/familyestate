'use client'

import { useState } from 'react'
import { DollarSign, PieChart, Percent, Activity } from 'lucide-react'
import { formatGBP, formatPercentage } from '@/lib/utils'
import SONIARateDisplay from '@/components/SONIARateDisplay'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { PropertyDetailView } from './PropertyDetailView'
import { PropertyWithPayments } from '@/lib/portfolio-calculations'

interface PortfolioSectionProps {
  portfolioMetrics: {
    totalLTV: number
    weightedAverageInterestRate: number
    monthlyCashflow: number
    totalPropertyValue: number
    totalMortgageBalance: number
    totalMonthlyRentalIncome: number
    totalMonthlyMortgagePayments: number
  }
  properties: PropertyWithPayments[]
}

export default function PortfolioSection({ portfolioMetrics, properties }: PortfolioSectionProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithPayments | null>(null)

  const metrics = [
    {
      label: 'Total LTV',
      value: formatPercentage(portfolioMetrics.totalLTV),
      description: 'Loan to Value (12 Rentals)',
      icon: Percent,
      trend: portfolioMetrics.totalLTV < 75 ? 'good' : 'warning',
    },
    {
      label: 'Weighted Avg Interest Rate',
      value: formatPercentage(portfolioMetrics.weightedAverageInterestRate),
      description: 'Total Debt Cost',
      icon: PieChart,
      trend: 'neutral',
    },
    {
      label: 'Monthly Cashflow',
      value: formatGBP(portfolioMetrics.monthlyCashflow),
      description: 'Rental Income - Mortgage Payments',
      icon: DollarSign,
      trend: portfolioMetrics.monthlyCashflow >= 0 ? 'up' : 'down',
    },
    {
      label: 'SONIA Rate',
      value: <SONIARateDisplay />,
      description: 'Bank of England',
      icon: Activity,
      trend: 'neutral',
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const isPositive = metric.trend === 'up'
            const isWarning = metric.trend === 'warning'
            
            return (
              <Card key={index}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isPositive
                          ? 'text-bloomberg-success'
                          : isWarning
                          ? 'text-bloomberg-warning'
                          : 'text-bloomberg-accent'
                      }`}
                    />
                  </div>
                  <p className="text-sm text-bloomberg-textMuted mb-1">{metric.label}</p>
                  <div className="text-2xl font-bold text-bloomberg-text mb-1">
                    {typeof metric.value === 'string' ? metric.value : metric.value}
                  </div>
                  <p className="text-xs text-bloomberg-textMuted">{metric.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-bloomberg-textMuted">Total Property Value</span>
                <span className="text-sm font-semibold text-bloomberg-text">
                  {formatGBP(portfolioMetrics.totalPropertyValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-bloomberg-textMuted">Total Mortgage Balance</span>
                <span className="text-sm font-semibold text-bloomberg-text">
                  {formatGBP(portfolioMetrics.totalMortgageBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-bloomberg-textMuted">Monthly Rental Income</span>
                <span className="text-sm font-semibold text-bloomberg-success">
                  {formatGBP(portfolioMetrics.totalMonthlyRentalIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-bloomberg-textMuted">Monthly Mortgage Payments</span>
                <span className="text-sm font-semibold text-bloomberg-text">
                  {formatGBP(portfolioMetrics.totalMonthlyMortgagePayments)}
                </span>
              </div>
              <div className="pt-3 border-t border-bloomberg-border">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-bloomberg-text">Net Monthly Cashflow</span>
                  <span
                    className={`text-sm font-bold ${
                      portfolioMetrics.monthlyCashflow >= 0
                        ? 'text-bloomberg-success'
                        : 'text-bloomberg-danger'
                    }`}
                  >
                    {formatGBP(portfolioMetrics.monthlyCashflow)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>UK Rental Properties (12 Properties)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Purchase Price</TableHead>
                    <TableHead className="text-right">Mortgage Balance</TableHead>
                    <TableHead className="text-right">LTV</TableHead>
                    <TableHead className="text-right">Interest Rate</TableHead>
                    <TableHead className="text-right">Monthly Income</TableHead>
                    <TableHead className="text-right">Monthly Payment</TableHead>
                    <TableHead className="text-right">Cashflow</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow 
                      key={property.id}
                      className="cursor-pointer hover:bg-bloomberg-darker transition-colors"
                      onClick={() => setSelectedProperty(property)}
                    >
                      <TableCell>
                        <div>
                          <div className="text-sm font-semibold text-bloomberg-text">{property.name}</div>
                          <div className="text-xs text-bloomberg-textMuted">{property.location}</div>
                          {property.loanType === 'variable' && (
                            <span className="text-xs text-bloomberg-warning mt-1 inline-block">Variable</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-bloomberg-text">
                          {formatGBP(property.purchasePrice)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-bloomberg-text">
                          {formatGBP(property.currentMortgageBalance)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-bloomberg-text">
                          {formatPercentage(property.ltv)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-bloomberg-text">
                          {formatPercentage(property.effectiveInterestRate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-bloomberg-success">
                          {formatGBP(property.monthlyRentalIncome)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-bloomberg-text">
                          {formatGBP(property.monthlyMortgagePayment)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-sm font-mono font-semibold ${
                            property.monthlyCashflow >= 0
                              ? 'text-bloomberg-success'
                              : 'text-bloomberg-danger'
                          }`}
                        >
                          {formatGBP(property.monthlyCashflow)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailView
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  )
}
