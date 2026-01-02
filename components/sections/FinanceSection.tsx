'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, CreditCard, PiggyBank, Database, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatGBP, formatUKDate, formatPercentage } from '@/lib/utils'
import { cashPosition, debts, expenses, properties } from '@/lib/mock-data/seed'
import { ReconciliationDashboard } from '@/components/reconciliation'
import { ApprovalWorkflowPanel } from '@/components/approvals'

export default function FinanceSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reconciliation' | 'approvals'>('overview')
  
  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0)
  const monthlyDebtPayments = debts.reduce((sum, d) => sum + d.monthlyPayment, 0)
  const totalEquity = properties.reduce((sum, p) => sum + ((p.currentValue || 0) - (p.mortgageBalance || 0)), 0)
  const totalAssetValue = properties.reduce((sum, p) => sum + (p.currentValue || 0), 0)
  const overallLTV = (totalDebt / totalAssetValue) * 100

  const pendingExpenses = expenses.filter(e => e.status === 'PENDING')
  const upcomingPayments = pendingExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-bloomberg-border pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-bloomberg-accent text-white'
              : 'bg-bloomberg-darker text-bloomberg-textMuted hover:text-bloomberg-text'
          }`}
        >
          <Wallet className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'reconciliation'
              ? 'bg-bloomberg-accent text-white'
              : 'bg-bloomberg-darker text-bloomberg-textMuted hover:text-bloomberg-text'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Reconciliation
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'bg-bloomberg-accent text-white'
              : 'bg-bloomberg-darker text-bloomberg-textMuted hover:text-bloomberg-text'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Approvals
          <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-500 rounded-full">3</span>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-bloomberg-panel to-bloomberg-darker border-t-4 border-t-bloomberg-success">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="w-5 h-5 text-bloomberg-success" />
                </div>
                <p className="text-sm text-bloomberg-textMuted mb-1">Total Cash</p>
                <p className="text-2xl font-bold text-bloomberg-text">
                  {formatGBP(cashPosition.operatingBalance + cashPosition.reserveBalance)}
                </p>
                <p className="text-xs text-bloomberg-success mt-1">
                  +{formatGBP(cashPosition.inflows - cashPosition.outflows)} today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-bloomberg-panel to-bloomberg-darker border-t-4 border-t-bloomberg-accent">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <PiggyBank className="w-5 h-5 text-bloomberg-accent" />
                </div>
                <p className="text-sm text-bloomberg-textMuted mb-1">Total Equity</p>
                <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(totalEquity)}</p>
                <p className="text-xs text-bloomberg-textMuted mt-1">
                  Assets: {formatGBP(totalAssetValue)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-bloomberg-panel to-bloomberg-darker border-t-4 border-t-bloomberg-warning">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-5 h-5 text-bloomberg-warning" />
                </div>
                <p className="text-sm text-bloomberg-textMuted mb-1">Total Debt</p>
                <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(totalDebt)}</p>
                <p className="text-xs text-bloomberg-textMuted mt-1">
                  LTV: {formatPercentage(overallLTV)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-bloomberg-panel to-bloomberg-darker border-t-4 border-t-bloomberg-danger">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <TrendingDown className="w-5 h-5 text-bloomberg-danger" />
                </div>
                <p className="text-sm text-bloomberg-textMuted mb-1">Monthly Debt Service</p>
                <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(monthlyDebtPayments)}</p>
                <p className="text-xs text-bloomberg-textMuted mt-1">
                  Upcoming: {formatGBP(upcomingPayments)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Debt Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-bloomberg-accent" />
                Debt Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property / Lender</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="text-right">Maturity</TableHead>
                    <TableHead className="text-center">Fixed/Variable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => {
                    const property = properties.find(p => p.id === debt.propertyId)
                    const isFixedExpiring = debt.isFixed && debt.fixedUntil && 
                      new Date(debt.fixedUntil) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)

                    return (
                      <TableRow key={debt.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-bloomberg-text">{property?.name || 'Portfolio'}</p>
                            <p className="text-xs text-bloomberg-textMuted">{debt.lender}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-bloomberg-textMuted">{debt.loanType}</TableCell>
                        <TableCell className="text-right font-mono text-bloomberg-text">
                          {formatGBP(debt.currentBalance)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-bloomberg-text">
                          {formatPercentage(debt.interestRate)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-bloomberg-text">
                          {formatGBP(debt.monthlyPayment)}
                        </TableCell>
                        <TableCell className="text-right text-bloomberg-textMuted">
                          {formatUKDate(new Date(debt.maturityDate))}
                        </TableCell>
                        <TableCell className="text-center">
                          {debt.isFixed ? (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              isFixedExpiring 
                                ? 'bg-bloomberg-warning/10 text-bloomberg-warning' 
                                : 'bg-bloomberg-success/10 text-bloomberg-success'
                            }`}>
                              Fixed {debt.fixedUntil && `→ ${formatUKDate(new Date(debt.fixedUntil))}`}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-bloomberg-accent/10 text-bloomberg-accent">
                              Variable
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Upcoming Expenses & Cash Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="w-5 h-5 text-bloomberg-danger" />
                  Upcoming Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingExpenses.map((expense) => {
                  const property = properties.find(p => p.id === expense.propertyId)
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-bloomberg-darker rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-bloomberg-text">{expense.vendor}</p>
                        <p className="text-xs text-bloomberg-textMuted">
                          {property?.name || 'Portfolio'} • {expense.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-bloomberg-text">{formatGBP(expense.amount)}</p>
                        {expense.dueDate && (
                          <p className="text-xs text-bloomberg-textMuted">
                            Due: {formatUKDate(new Date(expense.dueDate))}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-bloomberg-success" />
                  Cash Flow Projection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bloomberg-textMuted">Current Balance</span>
                    <span className="font-mono font-semibold text-bloomberg-text">
                      {formatGBP(cashPosition.operatingBalance + cashPosition.reserveBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bloomberg-textMuted">30-Day Projection</span>
                    <span className="font-mono font-semibold text-bloomberg-success">
                      {formatGBP(cashPosition.projected30Day || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bloomberg-textMuted">90-Day Projection</span>
                    <span className="font-mono font-semibold text-bloomberg-success">
                      {formatGBP(cashPosition.projected90Day || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-bloomberg-border">
                  <p className="text-xs text-bloomberg-textMuted mb-2">Monthly Overview</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-bloomberg-success/10 rounded-lg">
                      <p className="text-xs text-bloomberg-textMuted">Expected Inflows</p>
                      <p className="text-lg font-bold text-bloomberg-success">{formatGBP(85000)}</p>
                    </div>
                    <div className="p-3 bg-bloomberg-danger/10 rounded-lg">
                      <p className="text-xs text-bloomberg-textMuted">Expected Outflows</p>
                      <p className="text-lg font-bold text-bloomberg-danger">{formatGBP(72000)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Reconciliation Tab */}
      {activeTab === 'reconciliation' && <ReconciliationDashboard />}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && <ApprovalWorkflowPanel />}
    </div>
  )
}
