'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { getMortgages, deleteMortgage } from '@/app/actions/mortgage-actions'
import { formatGBP, formatPercentage } from '@/lib/utils'
import { toast } from 'sonner'
import type { Mortgage } from '@/app/actions/mortgage-actions'

export default function MortgagesPage() {
  const [mortgages, setMortgages] = useState<Mortgage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  useEffect(() => {
    loadMortgages()
  }, [])

  const loadMortgages = async () => {
    try {
      const result = await getMortgages()
      if (result.success) {
        setMortgages(result.data)
      } else {
        toast.error(result.error || 'Failed to load mortgages')
      }
    } catch (error) {
      toast.error('Failed to load mortgages')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mortgage?')) return

    try {
      const result = await deleteMortgage(id)
      if (result.success) {
        toast.success('Mortgage deleted successfully')
        loadMortgages()
      } else {
        toast.error(result.error || 'Failed to delete mortgage')
      }
    } catch (error) {
      toast.error('Failed to delete mortgage')
    }
  }

  const filteredMortgages = mortgages.filter((mortgage) => {
    const matchesSearch =
      mortgage.lender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mortgage.account_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || mortgage.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mortgages</h1>
          <p className="text-slate-400 mt-1">Manage property mortgages and track LTV</p>
        </div>
        <Link
          href="/admin/mortgages/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Mortgage
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by lender or account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PAID_OFF">Paid Off</option>
          <option value="DEFAULTED">Defaulted</option>
        </select>
      </div>

      {/* Mortgages List */}
      {filteredMortgages.length > 0 ? (
        <div className="grid gap-4">
          {filteredMortgages.map((mortgage) => (
            <div
              key={mortgage.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{mortgage.lender_name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        mortgage.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {mortgage.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Current Balance</p>
                      <p className="text-lg font-semibold text-white">
                        {formatGBP(mortgage.current_balance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Monthly Payment</p>
                      <p className="text-lg font-semibold text-white">
                        {mortgage.monthly_payment ? formatGBP(mortgage.monthly_payment) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
                      <p className="text-lg font-semibold text-white">
                        {formatPercentage(mortgage.interest_rate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">LTV</p>
                      <p className="text-lg font-semibold text-white">
                        {mortgage.ltv_ratio ? `${mortgage.ltv_ratio.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  </div>

                  {mortgage.maturity_date && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        Matures: {new Date(mortgage.maturity_date).toLocaleDateString()}
                        {mortgage.remaining_years &&
                          ` (${mortgage.remaining_years.toFixed(1)} years remaining)`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/mortgages/${mortgage.id}`}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5 text-slate-400" />
                  </Link>
                  <button
                    onClick={() => handleDelete(mortgage.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
          <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No mortgages found</h3>
          <p className="text-slate-400 mb-4">
            {searchTerm || filterStatus !== 'ALL'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first mortgage'}
          </p>
          <Link
            href="/admin/mortgages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Mortgage
          </Link>
        </div>
      )}
    </div>
  )
}

