'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Hotel, 
  Coffee, 
  Home,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Loader2,
  Database,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Upload
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { 
  getProperties, 
  getPortfolioSummary, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  createUnit,
  seedPortfolioData,
  PropertyFormData,
  UnitFormData
} from '@/actions/portfolio'
import { PropertyType, UnitStatus } from '@prisma/client'

type Property = Awaited<ReturnType<typeof getProperties>>[0]
type Summary = Awaited<ReturnType<typeof getPortfolioSummary>>

export default function PortfolioAdminPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<PropertyType | 'ALL'>('ALL')
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [selectedPropertyForUnit, setSelectedPropertyForUnit] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [propertiesData, summaryData] = await Promise.all([
        getProperties(),
        getPortfolioSummary(),
      ])
      setProperties(propertiesData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load data:', error)
      showNotification('error', 'Failed to load portfolio data')
    }
    setLoading(false)
  }, [showNotification])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSeedData = async () => {
    setSeeding(true)
    try {
      const result = await seedPortfolioData()
      if (result.success) {
        showNotification('success', 'Portfolio data seeded successfully!')
        await loadData()
      } else {
        showNotification('error', result.message || 'Failed to seed data')
      }
    } catch (error) {
      showNotification('error', 'Failed to seed portfolio data')
    }
    setSeeding(false)
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property? This will also delete all associated units.')) {
      return
    }
    try {
      await deleteProperty(id)
      showNotification('success', 'Property deleted successfully')
      await loadData()
    } catch (error) {
      showNotification('error', 'Failed to delete property')
    }
  }

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'ALL' || p.type === filterType
    return matchesSearch && matchesType
  })

  const getPropertyIcon = (type: PropertyType) => {
    switch (type) {
      case 'HOTEL': return <Hotel className="w-5 h-5 text-purple-500" />
      case 'CAFE': return <Coffee className="w-5 h-5 text-amber-500" />
      case 'RESIDENTIAL': return <Home className="w-5 h-5 text-blue-500" />
      default: return <Building2 className="w-5 h-5" />
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          <span className="text-[var(--text-secondary)]">Loading portfolio...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' 
            : 'bg-red-500/10 border border-red-500/30 text-red-500'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Portfolio Admin</h1>
            <p className="text-sm text-[var(--text-muted)]">Manage your properties and units</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {properties.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors"
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              Seed Demo Data
            </button>
          )}
          <button
            onClick={() => {
              setEditingProperty(null)
              setShowPropertyModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-[var(--border-primary)]">
            <CardContent className="pt-4">
              <p className="text-xs text-[var(--text-muted)]">Properties</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{summary.totalProperties}</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--border-primary)]">
            <CardContent className="pt-4">
              <p className="text-xs text-[var(--text-muted)]">Total Units</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{summary.totalUnits}</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--border-primary)]">
            <CardContent className="pt-4">
              <p className="text-xs text-[var(--text-muted)]">Occupancy</p>
              <p className="text-2xl font-bold text-emerald-500">{summary.occupancyRate.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--border-primary)]">
            <CardContent className="pt-4">
              <p className="text-xs text-[var(--text-muted)]">Portfolio Value</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(summary.totalValue)}</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--border-primary)]">
            <CardContent className="pt-4">
              <p className="text-xs text-[var(--text-muted)]">Total Debt</p>
              <p className="text-2xl font-bold text-amber-500">{formatCurrency(summary.totalDebt)}</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--border-primary)]">
            <CardContent className="pt-4">
              <p className="text-xs text-[var(--text-muted)]">Equity</p>
              <p className="text-2xl font-bold text-cyan-500">{formatCurrency(summary.totalEquity)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PropertyType | 'ALL')}
            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="HOTEL">Hotel</option>
            <option value="CAFE">Cafe</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <Card className="border-[var(--border-primary)] border-dashed">
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No properties found
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {searchQuery || filterType !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first property or seeding demo data'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowPropertyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </button>
              {properties.length === 0 && (
                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Seed Demo Data
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties Table */}
      {filteredProperties.length > 0 && (
        <Card className="border-[var(--border-primary)]">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Units</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Mortgage</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Rate</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr 
                    key={property.id} 
                    className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {getPropertyIcon(property.type)}
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{property.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{property.city}, {property.postcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        property.type === 'HOTEL' ? 'bg-purple-500/10 text-purple-500' :
                        property.type === 'CAFE' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {property.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[var(--text-primary)]">{property._count.units}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[var(--text-primary)]">{formatCurrency(property.currentValue || property.purchasePrice)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[var(--text-primary)]">{formatCurrency(property.mortgageBalance)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[var(--text-primary)]">
                        {property.interestRate ? `${property.interestRate.toFixed(2)}%` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPropertyForUnit(property.id)
                            setShowUnitModal(true)
                          }}
                          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          title="Add Unit"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProperty(property)
                            setShowPropertyModal(true)
                          }}
                          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--text-muted)] hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/dashboard/portfolio/units/${property.id}`}
                          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Property Modal */}
      {showPropertyModal && (
        <PropertyModal
          property={editingProperty}
          onClose={() => {
            setShowPropertyModal(false)
            setEditingProperty(null)
          }}
          onSave={async (data) => {
            try {
              if (editingProperty) {
                await updateProperty(editingProperty.id, data)
                showNotification('success', 'Property updated successfully')
              } else {
                await createProperty(data)
                showNotification('success', 'Property created successfully')
              }
              await loadData()
              setShowPropertyModal(false)
              setEditingProperty(null)
            } catch (error) {
              showNotification('error', 'Failed to save property')
            }
          }}
        />
      )}

      {/* Unit Modal */}
      {showUnitModal && selectedPropertyForUnit && (
        <UnitModal
          propertyId={selectedPropertyForUnit}
          onClose={() => {
            setShowUnitModal(false)
            setSelectedPropertyForUnit(null)
          }}
          onSave={async (data) => {
            try {
              await createUnit(data)
              showNotification('success', 'Unit created successfully')
              await loadData()
              setShowUnitModal(false)
              setSelectedPropertyForUnit(null)
            } catch (error) {
              showNotification('error', 'Failed to create unit')
            }
          }}
        />
      )}
    </div>
  )
}

// ============================================
// PROPERTY MODAL COMPONENT
// ============================================

function PropertyModal({
  property,
  onClose,
  onSave,
}: {
  property: Property | null
  onClose: () => void
  onSave: (data: PropertyFormData) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PropertyFormData>({
    name: property?.name || '',
    type: property?.type || 'RESIDENTIAL',
    address: property?.address || '',
    city: property?.city || '',
    postcode: property?.postcode || '',
    description: property?.description || '',
    purchasePrice: property?.purchasePrice || undefined,
    currentValue: property?.currentValue || undefined,
    mortgageBalance: property?.mortgageBalance || undefined,
    interestRate: property?.interestRate || undefined,
    mortgageLender: property?.mortgageLender || '',
    mortgageType: property?.mortgageType || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-primary)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--border-primary)]">
        <div className="p-6 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="CAFE">Cafe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Postcode</label>
                <input
                  type="text"
                  required
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase">Financials</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Purchase Price (£)</label>
                <input
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Current Value (£)</label>
                <input
                  type="number"
                  value={formData.currentValue || ''}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Mortgage Balance (£)</label>
                <input
                  type="number"
                  value={formData.mortgageBalance || ''}
                  onChange={(e) => setFormData({ ...formData, mortgageBalance: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate || ''}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Lender</label>
                <input
                  type="text"
                  value={formData.mortgageLender || ''}
                  onChange={(e) => setFormData({ ...formData, mortgageLender: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Mortgage Type</label>
                <select
                  value={formData.mortgageType || ''}
                  onChange={(e) => setFormData({ ...formData, mortgageType: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="">Select type...</option>
                  <option value="FIXED">Fixed</option>
                  <option value="VARIABLE">Variable</option>
                  <option value="TRACKER">Tracker</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {property ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// UNIT MODAL COMPONENT
// ============================================

function UnitModal({
  propertyId,
  onClose,
  onSave,
}: {
  propertyId: string
  onClose: () => void
  onSave: (data: UnitFormData) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UnitFormData>({
    propertyId,
    unitNumber: '',
    status: 'VACANT',
    currentRate: 0,
    floor: undefined,
    type: '',
    bedrooms: undefined,
    bathrooms: undefined,
    squareMeters: undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-primary)] rounded-xl w-full max-w-lg border border-[var(--border-primary)]">
        <div className="p-6 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Unit</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Unit Number</label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                placeholder="e.g., 101, A1, Main"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UnitStatus })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="VACANT">Vacant</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Monthly Rate (£)</label>
              <input
                type="number"
                required
                value={formData.currentRate || ''}
                onChange={(e) => setFormData({ ...formData, currentRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Floor</label>
              <input
                type="number"
                value={formData.floor || ''}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

