'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, Building2, DollarSign, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateProperty } from '@/app/actions/admin-actions'
import { toast } from 'sonner'

// Validation schema
const propertySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Property name is required'),
  description: z.string().optional(),
  status: z.enum(['Active', 'Maintenance', 'Sold', 'Development', 'Archived']),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  hero_image_url: z.string().url().optional().or(z.literal('')),
  // Mortgage details
  mortgage_lender: z.string().optional(),
  mortgage_rate: z.string().optional(),
  mortgage_balance: z.string().optional(),
  mortgage_monthly_payment: z.string().optional(),
  mortgage_loan_type: z.string().optional(),
  mortgage_term_years: z.string().optional(),
  mortgage_start_date: z.string().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface Property {
  id: string
  name: string
  description: string | null
  status: string
  city: string | null
  country: string | null
  address: string | null
  hero_image_url: string | null
  mortgage_details: {
    lender?: string
    rate?: string
    balance?: number
    monthly_payment?: number
    loan_type?: string
    term_years?: number
    start_date?: string
  } | null
}

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'financials'>('basic')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      id: propertyId,
      name: '',
      description: '',
      status: 'Active',
      city: '',
      country: '',
      address: '',
      hero_image_url: '',
      mortgage_lender: '',
      mortgage_rate: '',
      mortgage_balance: '',
      mortgage_monthly_payment: '',
      mortgage_loan_type: '',
      mortgage_term_years: '',
      mortgage_start_date: '',
    },
  })

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single()

        if (error) throw error

        if (data) {
          setProperty(data)
          reset({
            id: data.id,
            name: data.name || '',
            description: data.description || '',
            status: data.status || 'Active',
            city: data.city || '',
            country: data.country || '',
            address: data.address || '',
            hero_image_url: data.hero_image_url || '',
            mortgage_lender: data.mortgage_details?.lender || '',
            mortgage_rate: data.mortgage_details?.rate || '',
            mortgage_balance: data.mortgage_details?.balance?.toString() || '',
            mortgage_monthly_payment: data.mortgage_details?.monthly_payment?.toString() || '',
            mortgage_loan_type: data.mortgage_details?.loan_type || '',
            mortgage_term_years: data.mortgage_details?.term_years?.toString() || '',
            mortgage_start_date: data.mortgage_details?.start_date || '',
          })
        }
      } catch (error) {
        console.error('Failed to load property:', error)
        toast.error('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      loadProperty()
    }
  }, [propertyId, supabase, reset])

  const onSubmit = async (data: PropertyFormData) => {
    setSaving(true)
    try {
      const formData = new FormData()
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await updateProperty(formData)
      
      if (result.success) {
        toast.success('Property updated successfully!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update property')
      }
    } catch (error) {
      console.error('Failed to update property:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update property')
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

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Property not found</h3>
          <Link
            href="/admin/properties"
            className="text-amber-400 hover:text-amber-500"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/properties"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Property</h1>
          <p className="text-slate-400">Update property information and mortgage details</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'basic'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Basic Information
          </div>
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'financials'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financials & Mortgage
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <input type="hidden" {...register('id')} />

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Sold">Sold</option>
                  <option value="Development">Development</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  {...register('country')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                <input
                  type="url"
                  {...register('hero_image_url')}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Mortgage Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Lender</label>
                <input
                  type="text"
                  {...register('mortgage_lender')}
                  placeholder="e.g., Barclays"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interest Rate</label>
                <input
                  type="text"
                  {...register('mortgage_rate')}
                  placeholder="e.g., 4.5%"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Balance (£)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('mortgage_balance')}
                  placeholder="e.g., 450000"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monthly Payment (£)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('mortgage_monthly_payment')}
                  placeholder="e.g., 2100"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loan Type</label>
                <select
                  {...register('mortgage_loan_type')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                >
                  <option value="">Select...</option>
                  <option value="fixed">Fixed Rate</option>
                  <option value="variable">Variable Rate</option>
                  <option value="tracker">Tracker</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Term (Years)</label>
                <input
                  type="number"
                  {...register('mortgage_term_years')}
                  placeholder="e.g., 25"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  {...register('mortgage_start_date')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/properties"
            className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

