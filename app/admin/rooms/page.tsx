'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2,
  BedDouble,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Check,
  X
} from 'lucide-react'

interface CMSRoom {
  id: string
  name: string
  roomNumber: string | null
  roomType: string
  viewType: string
  basePrice: number
  eventPrice: number | null
  isEventPremiumActive: boolean
  eventPremiumMultiplier: number
  isAvailable: boolean
  isPublished: boolean
  property: {
    id: string
    name: string
    location: string
  }
}

const viewTypeLabels: Record<string, string> = {
  WEMBLEY_ARCH: '🏟️ Wembley Arch',
  CITY_SKYLINE: '🌆 City Skyline',
  GARDEN: '🌳 Garden',
  COURTYARD: '🏛️ Courtyard',
  STREET: '🚗 Street',
  STANDARD: '📐 Standard',
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<CMSRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventModeFilter, setEventModeFilter] = useState(false)
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const loadRooms = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (eventModeFilter) params.set('eventMode', 'true')
      
      const res = await fetch(`/api/admin/rooms?${params}`)
      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load rooms:', error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [eventModeFilter])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    
    try {
      await fetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
      loadRooms()
    } catch (error) {
      console.error('Delete failed:', error)
    }
    setActionMenu(null)
  }

  const handleToggleEventMode = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEventPremiumActive: !currentState }),
      })
      loadRooms()
    } catch (error) {
      console.error('Toggle failed:', error)
    }
    setActionMenu(null)
  }

  const handleBulkEventMode = async (enable: boolean) => {
    if (selectedRooms.length === 0) return
    setBulkActionLoading(true)
    
    try {
      await fetch('/api/admin/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomIds: selectedRooms,
          updates: { isEventPremiumActive: enable }
        }),
      })
      setSelectedRooms([])
      loadRooms()
    } catch (error) {
      console.error('Bulk update failed:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const toggleSelectRoom = (id: string) => {
    setSelectedRooms(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRooms.length === filteredRooms.length) {
      setSelectedRooms([])
    } else {
      setSelectedRooms(filteredRooms.map(r => r.id))
    }
  }

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.property.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Room Inventory</h1>
          <p className="text-slate-400">Manage hotel rooms and event pricing</p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </Link>
      </div>

      {/* Event Mode Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-amber-400">Wembley Event Mode</h3>
              <p className="text-sm text-slate-400">
                {rooms.filter(r => r.isEventPremiumActive).length} rooms with surge pricing active
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-slate-400">Show only event-enabled</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={eventModeFilter}
                onChange={(e) => setEventModeFilter(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>
        
        {selectedRooms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{selectedRooms.length} selected</span>
            <button
              onClick={() => handleBulkEventMode(true)}
              disabled={bulkActionLoading}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              Enable Event Mode
            </button>
            <button
              onClick={() => handleBulkEventMode(false)}
              disabled={bulkActionLoading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Disable
            </button>
          </div>
        )}
        
        <button
          onClick={loadRooms}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Rooms Table */}
      {loading ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-700">
                <div className="w-5 h-5 bg-slate-700 rounded" />
                <div className="w-12 h-12 bg-slate-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
          <BedDouble className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No rooms found</h3>
          <p className="text-slate-400 mb-4">
            {searchQuery ? 'Try a different search term' : 'Add your first room to get started'}
          </p>
          <Link
            href="/admin/rooms/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Room</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Property</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">View</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Base Price</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Event Price</th>
                <th className="text-center p-4 text-sm font-medium text-slate-400">Event Mode</th>
                <th className="w-12 p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr 
                  key={room.id} 
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                    selectedRooms.includes(room.id) ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRooms.includes(room.id)}
                      onChange={() => toggleSelectRoom(room.id)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-slate-400">
                        {room.roomType} {room.roomNumber && `• #${room.roomNumber}`}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{room.property.name}</td>
                  <td className="p-4 text-sm">{viewTypeLabels[room.viewType] || room.viewType}</td>
                  <td className="p-4 text-right font-mono">£{room.basePrice.toFixed(0)}</td>
                  <td className="p-4 text-right">
                    {room.isEventPremiumActive ? (
                      <span className="font-mono text-amber-400">
                        £{room.eventPrice?.toFixed(0) || (room.basePrice * room.eventPremiumMultiplier).toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      {room.isEventPremiumActive ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                          <Zap className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Off</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === room.id ? null : room.id)}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {actionMenu === room.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 py-1">
                          <Link
                            href={`/admin/rooms/${room.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" /> Edit Room
                          </Link>
                          <button
                            onClick={() => handleToggleEventMode(room.id, room.isEventPremiumActive)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors"
                          >
                            <Zap className="w-4 h-4" />
                            {room.isEventPremiumActive ? 'Disable' : 'Enable'} Event Mode
                          </button>
                          <hr className="my-1 border-slate-600" />
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

