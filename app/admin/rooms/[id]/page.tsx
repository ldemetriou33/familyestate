'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, Zap, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateUnit } from '@/app/actions/admin-actions'
import { toast } from 'sonner'
import { PRICING } from '@/lib/constants'

// Validation schema
const unitSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Room name is required'),
  base_price: z.string().min(1, 'Base price is required'),
  surge_price: z.string().optional(),
  is_event_mode_active: z.boolean(),
  amenities: z.array(z.string()),
  capacity: z.string().min(1),
  room_number: z.string().optional(),
  description: z.string().optional(),
  is_available: z.boolean(),
  is_published: z.boolean(),
})

type UnitFormData = z.infer<typeof unitSchema>

interface Room {
  id: string
  property_id: string
  name: string
  room_number: string | null
  category: string
  base_price: number
  surge_price: number | null
  is_event_mode_active: boolean
  capacity: number
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      id: roomId,
      name: '',
      base_price: '',
      surge_price: '',
      is_event_mode_active: false,
      amenities: [],
      capacity: '2',
      room_number: '',
      description: '',
      is_available: true,
      is_published: true,
    },
  })

  const isEventModeActive = watch('is_event_mode_active')
  const basePrice = watch('base_price')
  const amenities = watch('amenities')

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
        reset({
          id: roomData.id,
          name: roomData.name,
          base_price: roomData.base_price.toString(),
          surge_price: roomData.surge_price?.toString() || '',
          is_event_mode_active: roomData.is_event_mode_active,
          amenities: roomData.amenities || [],
          capacity: roomData.capacity.toString(),
          room_number: roomData.room_number || '',
          description: roomData.description || '',
          is_available: roomData.is_available,
          is_published: roomData.is_published,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load room')
        toast.error(err.message || 'Failed to load room')
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      loadData()
    }
  }, [roomId, supabase, reset])

  const onSubmit = async (data: UnitFormData) => {
    setSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else if (typeof value === 'boolean') {
            formData.append(key, value.toString())
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      const result = await updateUnit(formData)
      
      if (result.success) {
        toast.success('Room updated successfully!')
        router.refresh()
        router.push('/admin/rooms')
      } else {
        const errorMessage = result.error || 'Failed to update room'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update room'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this room? This action cannot be undone.')) return

    try {
      const { deleteUnit } = await import('@/app/actions/admin-actions')
      const result = await deleteUnit(roomId)

      if (result.success) {
        toast.success('Room deleted successfully!')
        router.push('/admin/rooms')
      } else {
        toast.error(result.error || 'Failed to delete room')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete room')
    }
  }

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = amenities || []
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity]
    setValue('amenities', newAmenities)
  }

  const availableAmenities = [
    'WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony',
    'Kitchenette', 'Wembley Arch View', 'Parking', 'Gym Access'
  ]

  const calculatedSurgePrice = isEventModeActive && basePrice
    ? (parseFloat(basePrice) * PRICING.DEFAULT_SURGE_MULTIPLIER).toFixed(2)
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <input type="hidden" {...register('id')} />
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
              <label className="block text-sm font-medium mb-2">Room Name *</label>
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
              <label className="block text-sm font-medium mb-2">Room Number</label>
              <input
                type="text"
                {...register('room_number')}
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
                step="0.01"
                min="0"
                {...register('base_price')}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              {errors.base_price && (
                <p className="mt-1 text-sm text-red-400">{errors.base_price.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input
                type="number"
                min="1"
                max="10"
                {...register('capacity')}
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
                  {...register('is_event_mode_active')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            
            {isEventModeActive && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Surge Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('surge_price')}
                    placeholder={calculatedSurgePrice || 'Auto-calculated'}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <p className="text-xs text-slate-400 mt-1">Leave empty for auto-calculation (1.5x base price)</p>
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
                  checked={amenities?.includes(amenity) || false}
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
              rows={5}
              {...register('description')}
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
                {...register('is_available')}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
              />
              <span>Available for Booking</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_published')}
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
