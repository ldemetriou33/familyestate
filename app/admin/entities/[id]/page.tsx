'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getEntity, updateEntity } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'
import type { Entity } from '@/app/actions/mortgage-actions'

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
  is_active: z.boolean().default(true),
})

type EntityFormData = z.infer<typeof entitySchema>

export default function EditEntityPage() {
  const router = useRouter()
  const params = useParams()
  const entityId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [entity, setEntity] = useState<Entity | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
  })

  useEffect(() => {
    const loadEntity = async () => {
      try {
        const result = await getEntity(entityId)
        if (result.success) {
          setEntity(result.data)
          reset({
            name: result.data.name,
            type: result.data.type,
            registration_number: result.data.registration_number || '',
            jurisdiction: result.data.jurisdiction,
            tax_id: result.data.tax_id || '',
            registered_address: result.data.registered_address || '',
            contact_email: result.data.contact_email || '',
            contact_phone: result.data.contact_phone || '',
            legal_representative: result.data.legal_representative || '',
            notes: result.data.notes || '',
            is_active: result.data.is_active,
          })
        }
      } catch (error) {
        toast.error('Failed to load entity')
      } finally {
        setLoading(false)
      }
    }

    if (entityId) {
      loadEntity()
    }
  }, [entityId, reset])

  const onSubmit = async (data: EntityFormData) => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('id', entityId)
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await updateEntity(formData)

      if (result.success) {
        toast.success('Entity updated successfully!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update entity')
      }
    } catch (error) {
      toast.error('Failed to update entity')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Entity not found</p>
        <Link href="/admin/entities" className="text-amber-400 hover:text-amber-300">
          Back to Entities
        </Link>
      </div>
    )
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
          <h1 className="text-2xl font-bold">Edit Entity</h1>
          <p className="text-slate-400">{entity.name}</p>
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

