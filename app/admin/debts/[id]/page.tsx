'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { getDebt, updateDebt, deleteDebt } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'
import type { Debt, Entity } from '@/app/actions/mortgage-actions'
import { createClient } from '@/lib/supabase/client'
import { getEntities } from '@/app/actions/mortgage-actions'
import { formatGBP } from '@/lib/utils'

const debtSchema = z.object({
  creditor_name: z.string().min(1),
  account_number: z.string().optional(),
  reference_number: z.string().optional(),
  debt_type: z.string().optional(),
  original_amount: z.string().min(1),
  current_balance: z.string().min(1),
  currency: z.string().optional(),
  interest_rate: z.string().optional(),
  structure: z.string().optional(),
  base_rate: z.string().optional(),
  margin: z.string().optional(),
  start_date: z.string().min(1),
  maturity_date: z.string().optional(),
  term_years: z.string().optional(),
  payment_frequency: z.string().optional(),
  next_payment_date: z.string().optional(),
  minimum_payment: z.string().optional(),
  status: z.string().optional(),
  secured_against: z.string().optional(),
  agreement_url: z.string().optional(),
  notes: z.string().optional(),
  property_id: z.string().optional(),
  entity_id: z.string().optional(),
  guarantor_entity_id: z.string().optional(),
})

type DebtFormData = z.infer<typeof debtSchema>

export default function EditDebtPage() {
  const router = useRouter()
  const params = useParams()
  const debtId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [debt, setDebt] = useState<Debt | null>(null)
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([])
  const [entities, setEntities] = useState<Entity[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load debt
        const debtResult = await getDebt(debtId)
        if (debtResult.success) {
          setDebt(debtResult.data)
          reset({
            creditor_name: debtResult.data.creditor_name,
            account_number: debtResult.data.account_number || '',
            reference_number: debtResult.data.reference_number || '',
            debt_type: debtResult.data.debt_type,
            original_amount: debtResult.data.original_amount.toString(),
            current_balance: debtResult.data.current_balance.toString(),
            currency: debtResult.data.currency,
            interest_rate: debtResult.data.interest_rate?.toString() || '',
            structure: debtResult.data.structure || '',
            base_rate: debtResult.data.base_rate || '',
            margin: debtResult.data.margin?.toString() || '',
            start_date: debtResult.data.start_date,
            maturity_date: debtResult.data.maturity_date || '',
            term_years: debtResult.data.term_years?.toString() || '',
            payment_frequency: debtResult.data.payment_frequency,
            next_payment_date: debtResult.data.next_payment_date || '',
            minimum_payment: debtResult.data.minimum_payment?.toString() || '',
            status: debtResult.data.status,
            secured_against: debtResult.data.secured_against || '',
            agreement_url: debtResult.data.agreement_url || '',
            notes: debtResult.data.notes || '',
            property_id: debtResult.data.property_id || '',
            entity_id: debtResult.data.entity_id || '',
            guarantor_entity_id: debtResult.data.guarantor_entity_id || '',
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
        toast.error('Failed to load debt')
      } finally {
        setLoading(false)
      }
    }

    if (debtId) {
      loadData()
    }
  }, [debtId, supabase, reset])

  const onSubmit = async (data: DebtFormData) => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('id', debtId)
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await updateDebt(formData)

      if (result.success) {
        toast.success('Debt updated successfully!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update debt')
      }
    } catch (error) {
      toast.error('Failed to update debt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this debt? This action cannot be undone.')) return

    try {
      const result = await deleteDebt(debtId)
      if (result.success) {
        toast.success('Debt deleted successfully!')
        router.push('/admin/debts')
      } else {
        toast.error(result.error || 'Failed to delete debt')
      }
    } catch (error) {
      toast.error('Failed to delete debt')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!debt) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Debt not found</p>
        <Link href="/admin/debts" className="text-amber-400 hover:text-amber-300">
          Back to Debts
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/debts"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Debt</h1>
            <p className="text-slate-400">{debt.creditor_name}</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Creditor Name *</label>
              <input
                type="text"
                {...register('creditor_name')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Debt Type</label>
              <select
                {...register('debt_type')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="MORTGAGE">Mortgage</option>
                <option value="BRIDGE_LOAN">Bridge Loan</option>
                <option value="DEVELOPMENT_FINANCE">Development Finance</option>
                <option value="PERSONAL_LOAN">Personal Loan</option>
                <option value="BUSINESS_LOAN">Business Loan</option>
                <option value="CREDIT_LINE">Credit Line</option>
                <option value="OVERDRAFT">Overdraft</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

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
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/debts"
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
    </div>
  )
}

