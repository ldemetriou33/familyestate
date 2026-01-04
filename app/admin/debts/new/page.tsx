'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createDebt, getEntities } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'
import type { Entity } from '@/app/actions/mortgage-actions'
import { createClient } from '@/lib/supabase/client'

const debtSchema = z.object({
  creditor_name: z.string().min(1, 'Creditor name is required'),
  account_number: z.string().optional(),
  reference_number: z.string().optional(),
  debt_type: z.string().optional().default('OTHER'),
  original_amount: z.string().min(1, 'Original amount is required'),
  current_balance: z.string().min(1, 'Current balance is required'),
  currency: z.string().optional().default('GBP'),
  interest_rate: z.string().optional(),
  structure: z.string().optional(),
  base_rate: z.string().optional(),
  margin: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  maturity_date: z.string().optional(),
  term_years: z.string().optional(),
  payment_frequency: z.string().optional().default('MONTHLY'),
  next_payment_date: z.string().optional(),
  minimum_payment: z.string().optional(),
  status: z.string().optional().default('ACTIVE'),
  secured_against: z.string().optional(),
  agreement_url: z.string().optional(),
  notes: z.string().optional(),
  property_id: z.string().optional(),
  entity_id: z.string().optional(),
  guarantor_entity_id: z.string().optional(),
})

type DebtFormData = z.infer<typeof debtSchema>

export default function NewDebtPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([])
  const [entities, setEntities] = useState<Entity[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      currency: 'GBP',
      debt_type: 'OTHER',
      payment_frequency: 'MONTHLY',
      status: 'ACTIVE',
    },
  })

  useEffect(() => {
    const loadData = async () => {
      const { data: propsData } = await supabase
        .from('properties')
        .select('id, name')
        .eq('is_published', true)
      setProperties(propsData || [])

      const entitiesResult = await getEntities()
      if (entitiesResult.success) {
        setEntities(entitiesResult.data)
      }
    }

    loadData()
  }, [supabase])

  const onSubmit = async (data: DebtFormData) => {
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await createDebt(formData)

      if (result.success) {
        toast.success('Debt created successfully!')
        router.push('/admin/debts')
      } else {
        toast.error(result.error || 'Failed to create debt')
      }
    } catch (error) {
      toast.error('Failed to create debt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/debts"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Debt</h1>
          <p className="text-slate-400">Add a new debt record</p>
        </div>
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
              {errors.creditor_name && (
                <p className="mt-1 text-sm text-red-400">{errors.creditor_name.message}</p>
              )}
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
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Debt
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

