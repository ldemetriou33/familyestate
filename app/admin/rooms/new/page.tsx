'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NewRoomPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  
  const [formData, setFormData] = useState({
    propertyId: '',
    name: '',
    roomNumber: '',
    floor: '',
    category: 'Room',
    basePrice: '',
    isEventModeActive: false,
    eventPremiumMultiplier: '1.5',
    capacity: '2',
    bedType: '',
    squareMeters: '',
    description: '',
    amenities: [] as string[],
    isAvailable: true,
    isPublished: true,
  })

  useEffect(() => {
    // Load properties
    const loadProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, name, slug')
          .eq('type', 'Hotel')
          .order('name')

        if (error) throw error
        setProperties(data || [])
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, propertyId: data[0].id }))
        }
      } catch (err) {
        console.error('Failed to load properties:', err)
      } finally {
        setLoadingProperties(false)
      }
    }

    loadProperties()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Calculate surge price if event mode is active
      const basePrice = parseFloat(formData.basePrice)
      const surgePrice = formData.isEventModeActive
        ? basePrice * parseFloat(formData.eventPremiumMultiplier)
        : null

      const { data, error: insertError } = await supabase
        .from('units')
        .insert({
          property_id: formData.propertyId,
          name: formData.name,
          room_number: formData.roomNumber || null,
          floor: formData.floor ? parseInt(formData.floor) : null,
          category: formData.category,
          base_price: basePrice,
          surge_price: surgePrice,
          is_event_mode_active: formData.isEventModeActive,
          capacity: parseInt(formData.capacity),
          bed_type: formData.bedType || null,
          square_meters: formData.squareMeters ? parseFloat(formData.squareMeters) : null,
          description: formData.description || null,
          amenities: formData.amenities,
          is_available: formData.isAvailable,
          is_published: formData.isPublished,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/admin/rooms/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create room')
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

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const availableAmenities = [
    'WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 
    'Kitchenette', 'Wembley Arch View', 'Parking', 'Gym Access'
  ]

  const calculatedSurgePrice = formData.isEventModeActive && formData.basePrice
    ? (parseFloat(formData.basePrice) * parseFloat(formData.eventPremiumMultiplier)).toFixed(2)
    : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/rooms"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Room</h1>
          <p className="text-slate-400">Create a new room or suite</p>
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
              <label className="block text-sm font-medium mb-2">Property *</label>
              {loadingProperties ? (
                <div className="h-10 bg-slate-700 animate-pulse rounded-lg" />
              ) : (
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                >
                  <option value="">Select property...</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.name}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Room Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Superking Arch View"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g., 101"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              >
                <option value="Room">Room</option>
                <option value="Suite">Suite</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Floor</label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="e.g., 1"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Event Mode */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Pricing & Event Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Base Price (£) *</label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                placeholder="120.00"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Bed Type</label>
              <input
                type="text"
                name="bedType"
                value={formData.bedType}
                onChange={handleChange}
                placeholder="e.g., Super King, Double, Twin"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Event Mode Toggle */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-amber-400">Wembley Event Mode</h3>
                  <p className="text-sm text-slate-400">Enable surge pricing for event days</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isEventModeActive"
                  checked={formData.isEventModeActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            
            {formData.isEventModeActive && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Surge Multiplier</label>
                  <input
                    type="number"
                    name="eventPremiumMultiplier"
                    value={formData.eventPremiumMultiplier}
                    onChange={handleChange}
                    step="0.1"
                    min="1"
                    max="3"
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <p className="text-xs text-slate-400 mt-1">1.5 = 50% increase</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Calculated Surge Price</label>
                  <div className="px-4 py-2.5 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                    <p className="text-lg font-bold text-amber-400">
                      {calculatedSurgePrice ? `£${calculatedSurgePrice}` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Amenities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableAmenities.map(amenity => (
              <label
                key={amenity}
                className="flex items-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Description</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Room Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the room, its features, and what makes it special..."
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Square Meters</label>
            <input
              type="number"
              name="squareMeters"
              value={formData.squareMeters}
              onChange={handleChange}
              step="0.1"
              placeholder="25.0"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Publishing */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Publishing</h2>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
              />
              <span>Available for Booking</span>
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
            href="/admin/rooms"
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
                Create Room
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

