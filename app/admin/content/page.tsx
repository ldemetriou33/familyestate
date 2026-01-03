'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Save, 
  Plus, 
  Trash2, 
  RefreshCw, 
  FileText,
  Check,
  Loader2,
  History,
  AlertCircle
} from 'lucide-react'

interface SiteContent {
  id: string
  key: string
  value: string
  section: string | null
  contentType: string
  label: string | null
  description: string | null
  version: number
  previousValue: string | null
  updatedAt: string
}

// Predefined content structure for easy setup
const defaultContentItems = [
  { key: 'homepage.hero.title', label: 'Hero Title', section: 'homepage', description: 'Main headline on the homepage' },
  { key: 'homepage.hero.subtitle', label: 'Hero Subtitle', section: 'homepage', description: 'Subheading under the main title' },
  { key: 'homepage.cta.text', label: 'CTA Button Text', section: 'homepage', description: 'Call-to-action button text' },
  { key: 'homepage.announcement', label: 'Announcement Banner', section: 'homepage', description: 'Optional banner message' },
  { key: 'seo.title', label: 'Default Page Title', section: 'seo', description: 'Browser tab title' },
  { key: 'seo.description', label: 'Meta Description', section: 'seo', description: 'Search engine description' },
  { key: 'contact.phone', label: 'Phone Number', section: 'contact', description: 'Contact phone number' },
  { key: 'contact.email', label: 'Email Address', section: 'contact', description: 'Contact email' },
  { key: 'contact.address', label: 'Physical Address', section: 'contact', description: 'Business address' },
]

export default function ContentPage() {
  const [content, setContent] = useState<SiteContent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [showAddNew, setShowAddNew] = useState(false)
  const [newItem, setNewItem] = useState({ key: '', value: '', label: '', section: '' })

  const loadContent = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content')
      const data = await res.json()
      setContent(Array.isArray(data) ? data : [])
      
      // Initialize edited values with current values
      const values: Record<string, string> = {}
      data.forEach((item: SiteContent) => {
        values[item.key] = item.value
      })
      setEditedValues(values)
    } catch (error) {
      console.error('Failed to load content:', error)
      setContent([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const handleSave = async (key: string) => {
    setSaving(true)
    try {
      const item = content.find(c => c.key === key)
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: editedValues[key],
          section: item?.section,
          label: item?.label,
        }),
      })
      setSavedKey(key)
      setTimeout(() => setSavedKey(null), 2000)
      loadContent()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const items = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value,
        section: content.find(c => c.key === key)?.section,
      }))
      
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      loadContent()
    } catch (error) {
      console.error('Save all failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.key) return
    
    setSaving(true)
    try {
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      setNewItem({ key: '', value: '', label: '', section: '' })
      setShowAddNew(false)
      loadContent()
    } catch (error) {
      console.error('Add failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm('Delete this content item?')) return
    
    try {
      await fetch(`/api/admin/content?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      loadContent()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleInitialize = async () => {
    setSaving(true)
    try {
      const items = defaultContentItems.map(item => ({
        ...item,
        value: '',
        contentType: 'text',
      }))
      
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      loadContent()
    } catch (error) {
      console.error('Initialize failed:', error)
    } finally {
      setSaving(false)
    }
  }

  // Group content by section
  const groupedContent = content.reduce((acc, item) => {
    const section = item.section || 'other'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {} as Record<string, SiteContent[]>)

  const hasChanges = content.some(item => editedValues[item.key] !== item.value)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Site Content</h1>
          <p className="text-slate-400">Edit text and content across your website</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Initialize Default Content */}
      {content.length === 0 && !loading && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No content items yet</h3>
          <p className="text-slate-400 mb-6">
            Initialize with default content structure to get started quickly
          </p>
          <button
            onClick={handleInitialize}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Initialize Default Content
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/4 mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-slate-700 rounded" />
                <div className="h-10 bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Content Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key *</label>
                <input
                  type="text"
                  value={newItem.key}
                  onChange={(e) => setNewItem(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., homepage.hero.title"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Label</label>
                <input
                  type="text"
                  value={newItem.label}
                  onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Human-readable name"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Section</label>
                <input
                  type="text"
                  value={newItem.section}
                  onChange={(e) => setNewItem(prev => ({ ...prev, section: e.target.value }))}
                  placeholder="e.g., homepage, seo, contact"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Value</label>
                <textarea
                  value={newItem.value}
                  onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddNew(false)}
                className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.key || saving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg disabled:opacity-50"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      {Object.entries(groupedContent).map(([section, items]) => (
        <div key={section} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-lg font-semibold capitalize">{section} Content</h2>
          </div>
          <div className="p-6 space-y-6">
            {items.map((item) => {
              const hasChange = editedValues[item.key] !== item.value
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {item.label || item.key}
                      {hasChange && <span className="ml-2 text-amber-400 text-xs">• Modified</span>}
                    </label>
                    <div className="flex items-center gap-2">
                      {savedKey === item.key && (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      )}
                      {item.version > 1 && (
                        <span className="flex items-center gap-1 text-slate-500 text-xs">
                          <History className="w-3 h-3" /> v{item.version}
                        </span>
                      )}
                      <button
                        onClick={() => handleSave(item.key)}
                        disabled={saving || !hasChange}
                        className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.key)}
                        className="p-1.5 hover:bg-slate-700 text-red-400 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  )}
                  {item.contentType === 'text' && item.key.includes('description') ? (
                    <textarea
                      value={editedValues[item.key] ?? item.value}
                      onChange={(e) => setEditedValues(prev => ({ ...prev, [item.key]: e.target.value }))}
                      rows={3}
                      className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        hasChange ? 'border-amber-500/50' : 'border-slate-600'
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editedValues[item.key] ?? item.value}
                      onChange={(e) => setEditedValues(prev => ({ ...prev, [item.key]: e.target.value }))}
                      className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        hasChange ? 'border-amber-500/50' : 'border-slate-600'
                      }`}
                    />
                  )}
                  <p className="text-xs text-slate-600 font-mono">{item.key}</p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

