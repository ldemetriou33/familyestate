'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createEntity } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'

const entitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  registration_number: z.string().optional(),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  tax_id: z.string().optional(),
  registered_address: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  legal_representative: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
})

type EntityFormData = z.infer<typeof entitySchema>

export default function NewEntityPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      is_active: true,
    },
  })

  const onSubmit = async (data: EntityFormData) => {
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await createEntity(formData)

      if (result.success) {
        toast.success('Entity created successfully!')
        router.push('/admin/entities')
      } else {
        toast.error(result.error || 'Failed to create entity')
      }
    } catch (error) {
      toast.error('Failed to create entity')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/entities"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Entity</h1>
          <p className="text-slate-400">Add a new legal structure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g., UK Property Ltd"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="">Select type...</option>
                <option value="PERSONAL">Personal</option>
                <option value="UK_LTD">UK Limited Company</option>
                <option value="UK_LLP">UK LLP</option>
                <option value="CYPRUS_COMPANY">Cyprus Company</option>
                <option value="DUBAI_IFZA">Dubai IFZA</option>
                <option value="TRUST">Trust</option>
                <option value="FOUNDATION">Foundation</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jurisdiction *</label>
              <input
                type="text"
                {...register('jurisdiction')}
                placeholder="e.g., UK, Cyprus, Dubai"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {errors.jurisdiction && (
                <p className="mt-1 text-sm text-red-400">{errors.jurisdiction.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Registration Number</label>
              <input
                type="text"
                {...register('registration_number')}
                placeholder="Company/Trust number"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tax ID</label>
              <input
                type="text"
                {...register('tax_id')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <input
                type="email"
                {...register('contact_email')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Registered Address</label>
              <textarea
                {...register('registered_address')}
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Legal Representative</label>
              <input
                type="text"
                {...register('legal_representative')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/entities"
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
                Create Entity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

