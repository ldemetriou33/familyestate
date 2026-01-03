'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Zap, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Room {
  id: string
  property_id: string
  name: string
  room_number: string | null
  floor: number | null
  category: string
  base_price: number
  surge_price: number | null
  is_event_mode_active: boolean
  capacity: number
  bed_type: string | null
  square_meters: number | null
  description: string | null
  amenities: string[]
  is_available: boolean
  is_published: boolean
}

export default function EditRoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([])

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
    const loadData = async () => {
      try {
        // Load room
        const { data: roomData, error: roomError } = await supabase
          .from('units')
          .select('*')
          .eq('id', roomId)
          .single()

        if (roomError) throw roomError
        if (!roomData) throw new Error('Room not found')

        setRoom(roomData as Room)

        // Load properties
        const { data: propsData, error: propsError } = await supabase
          .from('properties')
          .select('id, name')
          .eq('type', 'Hotel')

        if (propsError) throw propsError
        setProperties(propsData || [])

        // Populate form
        const multiplier = roomData.surge_price && roomData.base_price
          ? (roomData.surge_price / roomData.base_price).toFixed(1)
          : '1.5'

        setFormData({
          propertyId: roomData.property_id,
          name: roomData.name,
          roomNumber: roomData.room_number || '',
          floor: roomData.floor?.toString() || '',
          category: roomData.category,
          basePrice: roomData.base_price.toString(),
          isEventModeActive: roomData.is_event_mode_active,
          eventPremiumMultiplier: multiplier,
          capacity: roomData.capacity.toString(),
          bedType: roomData.bed_type || '',
          squareMeters: roomData.square_meters?.toString() || '',
          description: roomData.description || '',
          amenities: roomData.amenities || [],
          isAvailable: roomData.is_available,
          isPublished: roomData.is_published,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load room')
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      loadData()
    }
  }, [roomId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const basePrice = parseFloat(formData.basePrice)
      const surgePrice = formData.isEventModeActive
        ? basePrice * parseFloat(formData.eventPremiumMultiplier)
        : null

      const { error: updateError } = await supabase
        .from('units')
        .update({
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
        .eq('id', roomId)

      if (updateError) throw updateError

      router.push('/admin/rooms')
    } catch (err: any) {
      setError(err.message || 'Failed to update room')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this room? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', roomId)

      if (error) throw error
      router.push('/admin/rooms')
    } catch (err: any) {
      setError(err.message || 'Failed to delete room')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/admin/rooms" className="text-amber-400 hover:text-amber-300">
          ← Back to Rooms
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/rooms"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Room</h1>
            <p className="text-slate-400">{room?.name}</p>
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
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              >
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Room Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
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

