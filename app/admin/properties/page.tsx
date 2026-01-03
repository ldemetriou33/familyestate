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
  Eye,
  EyeOff,
  Star,
  Building2,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Archive
} from 'lucide-react'

interface CMSProperty {
  id: string
  name: string
  slug: string
  location: string
  assetType: 'HOTEL' | 'LAND' | 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE'
  status: 'ACTIVE' | 'SOLD' | 'MAINTENANCE' | 'DEVELOPMENT' | 'ARCHIVED'
  currentValue: number | null
  heroImageUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  rooms: Array<{ id: string; isEventPremiumActive: boolean }>
  createdAt: string
}

const statusColors = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  SOLD: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  MAINTENANCE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DEVELOPMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ARCHIVED: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
}

const assetTypeLabels = {
  HOTEL: 'Hotel',
  LAND: 'Land',
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  MIXED_USE: 'Mixed Use',
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<CMSProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const loadProperties = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      
      const res = await fetch(`/api/admin/properties?${params}`)
      const data = await res.json()
      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    
    try {
      await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
      loadProperties()
    } catch (error) {
      console.error('Delete failed:', error)
    }
    setActionMenu(null)
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadProperties()
    } catch (error) {
      console.error('Status update failed:', error)
    }
    setActionMenu(null)
  }

  const handleTogglePublish = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentState }),
      })
      loadProperties()
    } catch (error) {
      console.error('Publish toggle failed:', error)
    }
    setActionMenu(null)
  }

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-slate-400">Manage your property portfolio</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={loadProperties}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                !statusFilter ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All
            </button>
            {Object.entries(statusColors).map(([status]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  statusFilter === status ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 animate-pulse">
              <div className="h-40 bg-slate-700 rounded-lg mb-4" />
              <div className="h-6 bg-slate-700 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-slate-400 mb-4">
            {searchQuery ? 'Try a different search term' : 'Add your first property to get started'}
          </p>
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group hover:border-slate-600 transition-all"
            >
              {/* Image */}
              <div className="relative h-40 bg-slate-700">
                {property.heroImageUrl ? (
                  <img
                    src={property.heroImageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-slate-500" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[property.status]}`}>
                    {property.status}
                  </span>
                </div>
                
                {/* Featured Star */}
                {property.isFeatured && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                )}
                
                {/* Published Status */}
                <div className="absolute bottom-2 right-2">
                  {property.isPublished ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      <Eye className="w-3 h-3" /> Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                      <EyeOff className="w-3 h-3" /> Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{property.name}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {property.location}
                    </p>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActionMenu(actionMenu === property.id ? null : property.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {actionMenu === property.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 py-1">
                        <Link
                          href={`/admin/properties/${property.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(property.id, property.isPublished)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors"
                        >
                          {property.isPublished ? (
                            <>
                              <EyeOff className="w-4 h-4" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" /> Publish
                            </>
                          )}
                        </button>
                        <hr className="my-1 border-slate-600" />
                        <button
                          onClick={() => handleStatusChange(property.id, 'SOLD')}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-slate-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark as Sold
                        </button>
                        <button
                          onClick={() => handleStatusChange(property.id, 'ARCHIVED')}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-slate-600 transition-colors"
                        >
                          <Archive className="w-4 h-4" /> Archive
                        </button>
                        <hr className="my-1 border-slate-600" />
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                  <span className="text-xs text-slate-500">
                    {assetTypeLabels[property.assetType]}
                  </span>
                  {property.currentValue && (
                    <span className="text-sm font-medium">
                      £{property.currentValue.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Rooms count */}
                {property.rooms.length > 0 && (
                  <div className="mt-2 text-xs text-slate-400">
                    {property.rooms.length} room{property.rooms.length !== 1 ? 's' : ''}
                    {property.rooms.some(r => r.isEventPremiumActive) && (
                      <span className="ml-2 text-amber-400">• Event mode active</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

