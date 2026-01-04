'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { getDebts, deleteDebt } from '@/app/actions/mortgage-actions'
import { formatGBP } from '@/lib/utils'
import { toast } from 'sonner'
import type { Debt } from '@/app/actions/mortgage-actions'

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      const result = await getDebts()
      if (result.success) {
        setDebts(result.data)
      } else {
        toast.error(result.error || 'Failed to load debts')
      }
    } catch (error) {
      toast.error('Failed to load debts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this debt?')) return

    try {
      const result = await deleteDebt(id)
      if (result.success) {
        toast.success('Debt deleted successfully')
        loadDebts()
      } else {
        toast.error(result.error || 'Failed to delete debt')
      }
    } catch (error) {
      toast.error('Failed to delete debt')
    }
  }

  const filteredDebts = debts.filter(
    (debt) =>
      debt.creditor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.account_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Debts</h1>
          <p className="text-slate-400 mt-1">Manage non-mortgage debt</p>
        </div>
        <Link
          href="/admin/debts/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Debt
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by creditor or account number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {filteredDebts.length > 0 ? (
        <div className="grid gap-4">
          {filteredDebts.map((debt) => (
            <div
              key={debt.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{debt.creditor_name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-400 rounded">
                      {debt.debt_type}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        debt.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {debt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Current Balance</p>
                      <p className="text-lg font-semibold text-white">
                        {formatGBP(debt.current_balance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Monthly Payment</p>
                      <p className="text-lg font-semibold text-white">
                        {debt.monthly_payment ? formatGBP(debt.monthly_payment) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
                      <p className="text-lg font-semibold text-white">
                        {debt.interest_rate ? `${debt.interest_rate.toFixed(2)}%` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Currency</p>
                      <p className="text-lg font-semibold text-white">{debt.currency}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/debts/${debt.id}`}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5 text-slate-400" />
                  </Link>
                  <button
                    onClick={() => handleDelete(debt.id)}
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
          <TrendingDown className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No debts found</h3>
          <p className="text-slate-400 mb-4">Get started by adding your first debt</p>
          <Link
            href="/admin/debts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Debt
          </Link>
        </div>
      )}
    </div>
  )
}

