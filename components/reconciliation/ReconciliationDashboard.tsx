'use client'

import { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  ArrowRight,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP } from '@/lib/utils'

interface ReconciliationItem {
  id: string
  sourceType: 'Hotel PMS' | 'Cafe POS' | 'Rent Roll'
  sourceAmount: number
  bankAmount: number
  variance: number
  status: 'MATCHED' | 'UNMATCHED' | 'FLAGGED'
  date: Date
  description: string
}

// Mock data
const mockReconciliationItems: ReconciliationItem[] = [
  {
    id: '1',
    sourceType: 'Hotel PMS',
    sourceAmount: 3450.00,
    bankAmount: 3450.00,
    variance: 0,
    status: 'MATCHED',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    description: 'Daily hotel revenue',
  },
  {
    id: '2',
    sourceType: 'Cafe POS',
    sourceAmount: 1250.50,
    bankAmount: 1250.50,
    variance: 0,
    status: 'MATCHED',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    description: 'Daily cafe takings',
  },
  {
    id: '3',
    sourceType: 'Rent Roll',
    sourceAmount: 1500.00,
    bankAmount: 1500.00,
    variance: 0,
    status: 'MATCHED',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'Flat 2A - John Smith',
  },
  {
    id: '4',
    sourceType: 'Hotel PMS',
    sourceAmount: 2890.00,
    bankAmount: 0,
    variance: 2890.00,
    status: 'UNMATCHED',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    description: 'Daily hotel revenue - missing bank deposit',
  },
  {
    id: '5',
    sourceType: 'Cafe POS',
    sourceAmount: 980.00,
    bankAmount: 920.00,
    variance: 60.00,
    status: 'FLAGGED',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    description: 'Cafe takings - variance needs review',
  },
]

const statusConfig = {
  MATCHED: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Matched' },
  UNMATCHED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Unmatched' },
  FLAGGED: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Flagged' },
}

export function ReconciliationDashboard() {
  const [items] = useState(mockReconciliationItems)
  const [isRunning, setIsRunning] = useState(false)
  const [filter, setFilter] = useState<'all' | 'MATCHED' | 'UNMATCHED' | 'FLAGGED'>('all')

  const matchedCount = items.filter(i => i.status === 'MATCHED').length
  const unmatchedCount = items.filter(i => i.status === 'UNMATCHED').length
  const flaggedCount = items.filter(i => i.status === 'FLAGGED').length
  const matchRate = items.length > 0 ? (matchedCount / items.length) * 100 : 0

  const totalSourceAmount = items.reduce((sum, i) => sum + i.sourceAmount, 0)
  const totalBankAmount = items.reduce((sum, i) => sum + i.bankAmount, 0)
  const totalVariance = items.reduce((sum, i) => sum + i.variance, 0)

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(i => i.status === filter)

  const handleRunReconciliation = async () => {
    setIsRunning(true)
    // Simulate reconciliation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRunning(false)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-bloomberg-textMuted">Match Rate</p>
                <p className="text-2xl font-bold text-bloomberg-success">{matchRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-bloomberg-textMuted">Matched</p>
                <p className="text-2xl font-bold text-green-500">{matchedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-bloomberg-textMuted">Unmatched</p>
                <p className="text-2xl font-bold text-red-500">{unmatchedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-bloomberg-textMuted">Flagged</p>
                <p className="text-2xl font-bold text-amber-500">{flaggedCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Panel */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-5 h-5 text-bloomberg-accent" />
              Reconciliation: Bank vs Source Systems
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-3 py-1.5 text-sm bg-bloomberg-darker border border-bloomberg-border rounded-lg text-bloomberg-text"
              >
                <option value="all">All Items</option>
                <option value="MATCHED">Matched Only</option>
                <option value="UNMATCHED">Unmatched Only</option>
                <option value="FLAGGED">Flagged Only</option>
              </select>
              <button
                onClick={handleRunReconciliation}
                disabled={isRunning}
                className="px-4 py-1.5 text-sm font-medium text-white bg-bloomberg-accent rounded-lg hover:bg-bloomberg-accent/80 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running...' : 'Run Reconciliation'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Totals Row */}
          <div className="p-4 bg-bloomberg-darker rounded-lg mb-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-bloomberg-textMuted mb-1">Source Total</p>
                <p className="text-lg font-semibold text-bloomberg-text">{formatGBP(totalSourceAmount)}</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-bloomberg-textMuted" />
              </div>
              <div>
                <p className="text-bloomberg-textMuted mb-1">Bank Total</p>
                <p className="text-lg font-semibold text-bloomberg-text">{formatGBP(totalBankAmount)}</p>
              </div>
              <div>
                <p className="text-bloomberg-textMuted mb-1">Total Variance</p>
                <p className={`text-lg font-semibold ${totalVariance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatGBP(totalVariance)}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bloomberg-border">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Source</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Description</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Source Amt</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Bank Amt</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Variance</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Status</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-bloomberg-textMuted">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const config = statusConfig[item.status]
                  const Icon = config.icon

                  return (
                    <tr key={item.id} className="border-b border-bloomberg-border/50 hover:bg-bloomberg-darker/50">
                      <td className="py-3 px-2 text-sm text-bloomberg-textMuted">
                        {item.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs px-2 py-1 bg-bloomberg-darker rounded text-bloomberg-text">
                          {item.sourceType}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-bloomberg-text">{item.description}</td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-bloomberg-text">
                        {formatGBP(item.sourceAmount)}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-mono text-bloomberg-text">
                        {item.bankAmount > 0 ? formatGBP(item.bankAmount) : '-'}
                      </td>
                      <td className={`py-3 px-2 text-sm text-right font-mono ${
                        item.variance > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {item.variance > 0 ? formatGBP(item.variance) : '-'}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center">
                          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {item.status !== 'MATCHED' && (
                          <button className="text-xs text-bloomberg-accent hover:underline">
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReconciliationDashboard

