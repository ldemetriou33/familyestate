'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Building2, Globe } from 'lucide-react'
import Link from 'next/link'
import { getEntities } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'
import type { Entity } from '@/app/actions/mortgage-actions'

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      const result = await getEntities()
      if (result.success) {
        setEntities(result.data)
      } else {
        toast.error(result.error || 'Failed to load entities')
      }
    } catch (error) {
      toast.error('Failed to load entities')
    } finally {
      setLoading(false)
    }
  }

  const filteredEntities = entities.filter(
    (entity) =>
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Entities</h1>
          <p className="text-slate-400 mt-1">Manage legal structures (companies, trusts, personal)</p>
        </div>
        <Link
          href="/admin/entities/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Entity
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or jurisdiction..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {filteredEntities.length > 0 ? (
        <div className="grid gap-4">
          {filteredEntities.map((entity) => (
            <Link
              key={entity.id}
              href={`/admin/entities/${entity.id}`}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-semibold text-white">{entity.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-400 rounded">
                      {entity.type}
                    </span>
                    {entity.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-400 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>{entity.jurisdiction}</span>
                    </div>
                    {entity.registration_number && (
                      <div>
                        <span className="text-slate-500">Reg: </span>
                        <span>{entity.registration_number}</span>
                      </div>
                    )}
                    {entity.tax_id && (
                      <div>
                        <span className="text-slate-500">Tax ID: </span>
                        <span>{entity.tax_id}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Edit className="w-5 h-5 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No entities found</h3>
          <p className="text-slate-400 mb-4">Get started by adding your first entity</p>
          <Link
            href="/admin/entities/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entity
          </Link>
        </div>
      )}
    </div>
  )
}

