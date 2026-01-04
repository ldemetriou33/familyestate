'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, Trash2, TrendingUp, AlertTriangle, Calculator } from 'lucide-react'
import Link from 'next/link'
import { getMortgage, updateMortgage, deleteMortgage, runStressTest } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'
import type { Mortgage, Entity } from '@/app/actions/mortgage-actions'
import { createClient } from '@/lib/supabase/client'
import { getEntities } from '@/app/actions/mortgage-actions'
import { formatGBP, formatPercentage } from '@/lib/utils'
import { StressTestCalculator } from '@/components/mortgage/StressTestCalculator'

const mortgageSchema = z.object({
  lender_name: z.string().min(1),
  account_number: z.string().optional(),
  reference_number: z.string().optional(),
  original_loan_amount: z.string().min(1),
  current_balance: z.string().min(1),
  currency: z.string().optional(),
  interest_rate: z.string().min(1),
  structure: z.string().optional(),
  base_rate: z.string().optional(),
  margin: z.string().optional(),
  start_date: z.string().min(1),
  maturity_date: z.string().optional(),
  term_years: z.string().optional(),
  payment_frequency: z.string().optional(),
  next_payment_date: z.string().optional(),
  penalty_free_date: z.string().optional(),
  early_repayment_penalty: z.string().optional(),
  penalty_percentage: z.string().optional(),
  property_valuation: z.string().optional(),
  valuation_date: z.string().optional(),
  max_ltv_allowed: z.string().optional(),
  status: z.string().optional(),
  security_type: z.string().optional(),
  property_id: z.string().optional(),
  entity_id: z.string().optional(),
  guarantor_entity_id: z.string().optional(),
  mortgage_deed_url: z.string().optional(),
  offer_letter_url: z.string().optional(),
  valuation_report_url: z.string().optional(),
  notes: z.string().optional(),
  refinance_opportunity: z.boolean().optional(),
  refinance_notes: z.string().optional(),
})

type MortgageFormData = z.infer<typeof mortgageSchema>

export default function EditMortgagePage() {
  const router = useRouter()
  const params = useParams()
  const mortgageId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mortgage, setMortgage] = useState<Mortgage | null>(null)
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'stress-test'>('details')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      currency: 'GBP',
      structure: 'FIXED',
      payment_frequency: 'MONTHLY',
      status: 'ACTIVE',
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load mortgage
        const mortgageResult = await getMortgage(mortgageId)
        if (mortgageResult.success) {
          setMortgage(mortgageResult.data)
          reset({
            lender_name: mortgageResult.data.lender_name,
            account_number: mortgageResult.data.account_number || '',
            reference_number: mortgageResult.data.reference_number || '',
            original_loan_amount: mortgageResult.data.original_loan_amount.toString(),
            current_balance: mortgageResult.data.current_balance.toString(),
            currency: mortgageResult.data.currency,
            interest_rate: mortgageResult.data.interest_rate.toString(),
            structure: mortgageResult.data.structure,
            base_rate: mortgageResult.data.base_rate || '',
            margin: mortgageResult.data.margin?.toString() || '',
            start_date: mortgageResult.data.start_date,
            maturity_date: mortgageResult.data.maturity_date || '',
            term_years: mortgageResult.data.term_years?.toString() || '',
            payment_frequency: mortgageResult.data.payment_frequency,
            next_payment_date: mortgageResult.data.next_payment_date || '',
            penalty_free_date: mortgageResult.data.penalty_free_date || '',
            early_repayment_penalty: mortgageResult.data.early_repayment_penalty?.toString() || '',
            penalty_percentage: mortgageResult.data.penalty_percentage?.toString() || '',
            property_valuation: mortgageResult.data.property_valuation?.toString() || '',
            valuation_date: mortgageResult.data.valuation_date || '',
            max_ltv_allowed: mortgageResult.data.max_ltv_allowed?.toString() || '',
            status: mortgageResult.data.status,
            security_type: mortgageResult.data.security_type || '',
            property_id: mortgageResult.data.property_id || '',
            entity_id: mortgageResult.data.entity_id || '',
            guarantor_entity_id: mortgageResult.data.guarantor_entity_id || '',
            mortgage_deed_url: mortgageResult.data.mortgage_deed_url || '',
            offer_letter_url: mortgageResult.data.offer_letter_url || '',
            valuation_report_url: mortgageResult.data.valuation_report_url || '',
            notes: mortgageResult.data.notes || '',
            refinance_opportunity: mortgageResult.data.refinance_opportunity,
            refinance_notes: mortgageResult.data.refinance_notes || '',
          })
        }

        // Load properties
        const { data: propsData } = await supabase
          .from('properties')
          .select('id, name')
          .eq('is_published', true)
        setProperties(propsData || [])

        // Load entities
        const entitiesResult = await getEntities()
        if (entitiesResult.success) {
          setEntities(entitiesResult.data)
        }
      } catch (error) {
        toast.error('Failed to load mortgage')
      } finally {
        setLoading(false)
      }
    }

    if (mortgageId) {
      loadData()
    }
  }, [mortgageId, supabase, reset])

  const onSubmit = async (data: MortgageFormData) => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('id', mortgageId)
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await updateMortgage(formData)

      if (result.success) {
        toast.success('Mortgage updated successfully!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update mortgage')
      }
    } catch (error) {
      toast.error('Failed to update mortgage')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this mortgage? This action cannot be undone.')) return

    try {
      const result = await deleteMortgage(mortgageId)
      if (result.success) {
        toast.success('Mortgage deleted successfully!')
        router.push('/admin/mortgages')
      } else {
        toast.error(result.error || 'Failed to delete mortgage')
      }
    } catch (error) {
      toast.error('Failed to delete mortgage')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!mortgage) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Mortgage not found</p>
        <Link href="/admin/mortgages" className="text-amber-400 hover:text-amber-300">
          Back to Mortgages
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/mortgages"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Mortgage</h1>
            <p className="text-slate-400">{mortgage.lender_name}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'details'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Mortgage Details
        </button>
        <button
          onClick={() => setActiveTab('stress-test')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'stress-test'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Stress Test
          </div>
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Current Balance</p>
              <p className="text-xl font-bold text-white">{formatGBP(mortgage.current_balance)}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Monthly Payment</p>
              <p className="text-xl font-bold text-white">
                {mortgage.monthly_payment ? formatGBP(mortgage.monthly_payment) : '—'}
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">LTV</p>
              <p className="text-xl font-bold text-white">
                {mortgage.ltv_ratio ? `${mortgage.ltv_ratio.toFixed(1)}%` : '—'}
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
              <p className="text-xl font-bold text-white">{formatPercentage(mortgage.interest_rate)}</p>
            </div>
          </div>

          {/* Form fields - same as new page but with existing values */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Lender Name *</label>
                <input
                  type="text"
                  {...register('lender_name')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Property</label>
                <select
                  {...register('property_id')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select property...</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Entity</label>
                <select
                  {...register('entity_id')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select entity...</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name} ({entity.jurisdiction})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PAID_OFF">Paid Off</option>
                  <option value="DEFAULTED">Defaulted</option>
                  <option value="RESTRUCTURED">Restructured</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Financial Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Current Balance *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('current_balance')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.0001"
                  {...register('interest_rate')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Property Valuation</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('property_valuation')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/mortgages"
              className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Stress Test Tab */}
      {activeTab === 'stress-test' && mortgage && (
        <StressTestCalculator mortgage={mortgage} />
      )}
    </div>
  )
}

