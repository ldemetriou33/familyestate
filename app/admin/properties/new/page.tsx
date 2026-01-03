'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react'

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    country: 'UK',
    assetType: 'HOTEL',
    status: 'ACTIVE',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    description: '',
    shortDescription: '',
    address: '',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
    isPublished: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to create property')
      }

      const property = await res.json()
      router.push(`/admin/properties/${property.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
          <h1 className="text-2xl font-bold">Add New Property</h1>
          <p className="text-slate-400">Create a new property listing</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Property Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Abbey Point Hotel"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Wembley, London"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              >
                <option value="UK">United Kingdom</option>
                <option value="CY">Cyprus</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Asset Type</label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              >
                <option value="HOTEL">Hotel</option>
                <option value="LAND">Land</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="MIXED_USE">Mixed Use</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="DEVELOPMENT">In Development</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="SOLD">Sold</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Full Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Olympic Way, Wembley HA9 0PA"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Financial Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Purchase Price (£)</label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Current Value (£)</label>
              <input
                type="number"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Content</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="A brief tagline for listings..."
              maxLength={160}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.shortDescription.length}/160 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Detailed property description..."
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">SEO Settings</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              placeholder="Page title for search engines..."
              maxLength={60}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={2}
              maxLength={160}
              placeholder="Description for search results..."
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Publishing</h2>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
              />
              <span>Featured Property</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
              />
              <span>Publish Immediately</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/properties"
            className="px-6 py-2.5 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

