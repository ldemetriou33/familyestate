'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createMortgage, getEntities } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'
import type { Entity } from '@/app/actions/mortgage-actions'
import { createClient } from '@/lib/supabase/client'

const mortgageSchema = z.object({
  lender_name: z.string().min(1, 'Lender name is required'),
  account_number: z.string().optional(),
  reference_number: z.string().optional(),
  original_loan_amount: z.string().min(1, 'Original loan amount is required'),
  current_balance: z.string().min(1, 'Current balance is required'),
  currency: z.string().default('GBP'),
  interest_rate: z.string().min(1, 'Interest rate is required'),
  structure: z.string().default('FIXED'),
  base_rate: z.string().optional(),
  margin: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  maturity_date: z.string().optional(),
  term_years: z.string().optional(),
  payment_frequency: z.string().default('MONTHLY'),
  next_payment_date: z.string().optional(),
  penalty_free_date: z.string().optional(),
  early_repayment_penalty: z.string().optional(),
  penalty_percentage: z.string().optional(),
  property_valuation: z.string().optional(),
  valuation_date: z.string().optional(),
  max_ltv_allowed: z.string().optional(),
  status: z.string().default('ACTIVE'),
  security_type: z.string().optional(),
  property_id: z.string().optional(),
  entity_id: z.string().optional(),
  guarantor_entity_id: z.string().optional(),
  mortgage_deed_url: z.string().optional(),
  offer_letter_url: z.string().optional(),
  valuation_report_url: z.string().optional(),
  notes: z.string().optional(),
})

type MortgageFormData = z.infer<typeof mortgageSchema>

export default function NewMortgagePage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([])
  const [entities, setEntities] = useState<Entity[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    }

    loadData()
  }, [supabase])

  const onSubmit = async (data: MortgageFormData) => {
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await createMortgage(formData)

      if (result.success) {
        toast.success('Mortgage created successfully!')
        router.push('/admin/mortgages')
      } else {
        toast.error(result.error || 'Failed to create mortgage')
      }
    } catch (error) {
      toast.error('Failed to create mortgage')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/mortgages"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Mortgage</h1>
          <p className="text-slate-400">Add a new property mortgage</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
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
              {errors.lender_name && (
                <p className="mt-1 text-sm text-red-400">{errors.lender_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                {...register('account_number')}
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
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Financial Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Original Loan Amount *</label>
              <input
                type="number"
                step="0.01"
                {...register('original_loan_amount')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {errors.original_loan_amount && (
                <p className="mt-1 text-sm text-red-400">{errors.original_loan_amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Balance *</label>
              <input
                type="number"
                step="0.01"
                {...register('current_balance')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {errors.current_balance && (
                <p className="mt-1 text-sm text-red-400">{errors.current_balance.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                {...register('currency')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interest Rate (%) *</label>
              <input
                type="number"
                step="0.0001"
                {...register('interest_rate')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {errors.interest_rate && (
                <p className="mt-1 text-sm text-red-400">{errors.interest_rate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Structure</label>
              <select
                {...register('structure')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="FIXED">Fixed</option>
                <option value="VARIABLE">Variable</option>
                <option value="TRACKER">Tracker</option>
                <option value="DISCOUNT">Discount</option>
                <option value="OFFSET">Offset</option>
                <option value="INTEREST_ONLY">Interest Only</option>
                <option value="CAPITAL_REPAYMENT">Capital Repayment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Term (Years)</label>
              <input
                type="number"
                {...register('term_years')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Dates</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-400">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maturity Date</label>
              <input
                type="date"
                {...register('maturity_date')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Next Payment Date</label>
              <input
                type="date"
                {...register('next_payment_date')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Valuation & LTV */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Valuation & LTV</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Property Valuation</label>
              <input
                type="number"
                step="0.01"
                {...register('property_valuation')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <p className="text-xs text-slate-400 mt-1">LTV will be auto-calculated</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Valuation Date</label>
              <input
                type="date"
                {...register('valuation_date')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
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
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Mortgage
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

