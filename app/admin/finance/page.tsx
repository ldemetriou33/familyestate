'use client'

import { useState, useEffect } from 'react'
import { Building2, TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getPortfolioMetrics } from '@/app/actions/mortgage-actions'
import { formatGBP } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface PortfolioMetrics {
  totalMortgages: number
  totalDebt: number
  totalMonthlyPayments: number
  averageLTV: number
  totalEntities: number
  byEntity: Array<{
    entity_id: string
    entity_name: string
    totalDebt: number
    totalMonthlyPayments: number
  }>
}

export default function FinanceDashboard() {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const result = await getPortfolioMetrics()
        if (result.success) {
          setMetrics(result.data)
        }
      } catch (error) {
        console.error('Failed to load portfolio metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No financial data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
          <p className="text-slate-400 mt-1">Sovereign Estate Overview</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/entities"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Entities
          </Link>
          <Link
            href="/admin/mortgages/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Mortgage
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <span className="text-3xl font-bold text-white">
                {formatGBP(metrics.totalDebt)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Across {metrics.totalMortgages} mortgage{metrics.totalMortgages !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Monthly Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <span className="text-3xl font-bold text-white">
                {formatGBP(metrics.totalMonthlyPayments)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Total monthly debt service</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Average LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Percent className="w-5 h-5 text-slate-400" />
              <span className="text-3xl font-bold text-white">{metrics.averageLTV.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Loan-to-Value ratio</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Active Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Building2 className="w-5 h-5 text-slate-400" />
              <span className="text-3xl font-bold text-white">{metrics.totalEntities}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Legal structures</p>
          </CardContent>
        </Card>
      </div>

      {/* Entity Breakdown */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Debt by Entity</CardTitle>
          <p className="text-sm text-slate-400">Debt allocation across legal structures</p>
        </CardHeader>
        <CardContent>
          {metrics.byEntity.length > 0 ? (
            <div className="space-y-4">
              {metrics.byEntity.map((entity) => (
                <Link
                  key={entity.entity_id}
                  href={`/admin/entities/${entity.entity_id}`}
                  className="flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
                >
                  <div>
                    <h3 className="font-semibold text-white">{entity.entity_name}</h3>
                    <p className="text-sm text-slate-400">
                      {formatGBP(entity.totalMonthlyPayments)}/month
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatGBP(entity.totalDebt)}</p>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No entities with debt</p>
              <Link
                href="/admin/entities/new"
                className="text-amber-400 hover:text-amber-300 mt-2 inline-block"
              >
                Create your first entity
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/mortgages"
          className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-amber-400" />
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Mortgages</h3>
          <p className="text-sm text-slate-400">
            Manage property mortgages, track LTV, and monitor maturity dates
          </p>
        </Link>

        <Link
          href="/admin/debts"
          className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-8 h-8 text-amber-400" />
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Debts</h3>
          <p className="text-sm text-slate-400">
            Track loans, credit lines, and other non-mortgage debt
          </p>
        </Link>

        <Link
          href="/admin/entities"
          className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 text-amber-400" />
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Entities</h3>
          <p className="text-sm text-slate-400">
            Manage legal structures (UK Ltd, Dubai IFZA, Trusts, etc.)
          </p>
        </Link>
      </div>
    </div>
  )
}

