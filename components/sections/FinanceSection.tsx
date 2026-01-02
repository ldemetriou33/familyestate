'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, CreditCard, PiggyBank, Database, CheckCircle, Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatGBP, formatUKDate, formatPercentage } from '@/lib/utils'
import { cashPosition, debts, expenses, properties } from '@/lib/mock-data/seed'
import { ReconciliationDashboard } from '@/components/reconciliation'
import { ApprovalWorkflowPanel } from '@/components/approvals'
import { EmpireBrain } from '@/components/finance/EmpireBrain'

export default function FinanceSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'reconciliation' | 'approvals'>('overview')
  
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
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-primary)] pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Wallet className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('strategy')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'strategy'
              ? 'bg-gradient-to-r from-[var(--accent)] to-purple-600 text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Brain className="w-4 h-4" />
          Empire Brain
          <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-500 rounded-full">AI</span>
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'reconciliation'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Reconciliation
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
            <Card className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-t-4 border-t-green-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Total Cash</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatGBP(cashPosition.operatingBalance + cashPosition.reserveBalance)}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  +{formatGBP(cashPosition.inflows - cashPosition.outflows)} today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-t-4 border-t-[var(--accent)]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <PiggyBank className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Total Equity</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatGBP(totalEquity)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Assets: {formatGBP(totalAssetValue)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-t-4 border-t-amber-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Total Debt</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatGBP(totalDebt)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  LTV: {formatPercentage(overallLTV)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-t-4 border-t-red-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Monthly Debt Service</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatGBP(monthlyDebtPayments)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Upcoming: {formatGBP(upcomingPayments)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Debt Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-[var(--accent)]" />
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
                            <p className="font-semibold text-[var(--text-primary)]">{property?.name || 'Portfolio'}</p>
                            <p className="text-xs text-[var(--text-muted)]">{debt.lender}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--text-muted)]">{debt.loanType}</TableCell>
                        <TableCell className="text-right font-mono text-[var(--text-primary)]">
                          {formatGBP(debt.currentBalance)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[var(--text-primary)]">
                          {formatPercentage(debt.interestRate)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[var(--text-primary)]">
                          {formatGBP(debt.monthlyPayment)}
                        </TableCell>
                        <TableCell className="text-right text-[var(--text-muted)]">
                          {formatUKDate(new Date(debt.maturityDate))}
                        </TableCell>
                        <TableCell className="text-center">
                          {debt.isFixed ? (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              isFixedExpiring 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-green-500/10 text-green-500'
                            }`}>
                              Fixed {debt.fixedUntil && `→ ${formatUKDate(new Date(debt.fixedUntil))}`}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
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
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Upcoming Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingExpenses.map((expense) => {
                  const property = properties.find(p => p.id === expense.propertyId)
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{expense.vendor}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {property?.name || 'Portfolio'} • {expense.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-[var(--text-primary)]">{formatGBP(expense.amount)}</p>
                        {expense.dueDate && (
                          <p className="text-xs text-[var(--text-muted)]">
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
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Cash Flow Projection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Current Balance</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {formatGBP(cashPosition.operatingBalance + cashPosition.reserveBalance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">30-Day Projection</span>
                    <span className="font-mono font-semibold text-green-500">
                      {formatGBP(cashPosition.projected30Day || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">90-Day Projection</span>
                    <span className="font-mono font-semibold text-green-500">
                      {formatGBP(cashPosition.projected90Day || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-primary)]">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Monthly Overview</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Expected Inflows</p>
                      <p className="text-lg font-bold text-green-500">{formatGBP(85000)}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Expected Outflows</p>
                      <p className="text-lg font-bold text-red-500">{formatGBP(72000)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Strategy Tab - Empire Brain */}
      {activeTab === 'strategy' && <EmpireBrain />}

      {/* Reconciliation Tab */}
      {activeTab === 'reconciliation' && <ReconciliationDashboard />}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && <ApprovalWorkflowPanel />}
    </div>
  )
}
