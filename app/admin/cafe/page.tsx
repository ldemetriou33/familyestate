'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import type { CafeMenuItem } from '@/lib/supabase/types'

const categoryLabels: Record<string, string> = {
  Breakfast: '🍳 Breakfast',
  Lunch: '🍽️ Lunch',
  Dinner: '🥘 Dinner',
  Alcohol: '🍷 Alcohol',
  Event_Special: '🎉 Event Special',
  Dessert: '🍰 Dessert',
  Beverage: '☕ Beverage',
}

export default function CafeManagerPage() {
  const supabase = createClient()
  const [menuItems, setMenuItems] = useState<CafeMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const loadMenu = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('cafe_menu')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true })

      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Failed to load menu:', error)
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }, [supabase, categoryFilter])

  useEffect(() => {
    loadMenu()
  }, [loadMenu])

  const handleToggleAvailability = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('cafe_menu')
        .update({ is_available: !currentState })
        .eq('id', id)

      if (error) throw error
      loadMenu()
    } catch (error) {
      console.error('Toggle failed:', error)
    }
    setActionMenu(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item?')) return

    try {
      const { error } = await supabase
        .from('cafe_menu')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadMenu()
    } catch (error) {
      console.error('Delete failed:', error)
    }
    setActionMenu(null)
  }

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedByCategory = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, CafeMenuItem[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cafe & F&B Manager</h1>
          <p className="text-slate-400">Manage menu items and availability</p>
        </div>
        <a
          href="/admin/cafe/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </a>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="">All Categories</option>
          {Object.keys(categoryLabels).map(cat => (
            <option key={cat} value={cat}>{categoryLabels[cat]}</option>
          ))}
        </select>
        <button
          onClick={loadMenu}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Menu Items by Category */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-1/4 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-32 bg-slate-700 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedByCategory).length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
          <p className="text-slate-400 mb-4">No menu items found</p>
          <a
            href="/admin/cafe/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Item
          </a>
        </div>
      ) : (
        Object.entries(groupedByCategory).map(([category, items]) => (
          <div key={category} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-lg font-semibold">{categoryLabels[category] || category}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg transition-all ${
                      item.is_available
                        ? 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        : 'bg-slate-800/50 border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === item.id ? null : item.id)}
                          className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {actionMenu === item.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 py-1">
                            <button
                              onClick={() => handleToggleAvailability(item.id, item.is_available)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors"
                            >
                              {item.is_available ? (
                                <>
                                  <XCircle className="w-4 h-4" /> Mark Sold Out
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" /> Mark Available
                                </>
                              )}
                            </button>
                            <a
                              href={`/admin/cafe/${item.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </a>
                            <hr className="my-1 border-slate-600" />
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                      <span className="text-lg font-bold">£{item.price.toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.is_available
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.is_available ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

