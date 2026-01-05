'use client'

import { FileText, CheckCircle, XCircle, Clock, Upload } from 'lucide-react'
import { useSovereignStore } from '@/lib/store/sovereign-store'
import { useState } from 'react'

export default function DocumentVault() {
  const { documents, assets, entities } = useSovereignStore()
  const [filter, setFilter] = useState<'All' | 'Asset' | 'Entity'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Missing' | 'Expiring Soon'>('All')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Missing':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'Expiring Soon':
        return <Clock className="w-4 h-4 text-amber-600" />
      default:
        return <FileText className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'Missing':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'Expiring Soon':
        return 'bg-amber-50 border-amber-200 text-amber-700'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700'
    }
  }

  const getRelatedName = (doc: typeof documents[0]) => {
    if (doc.related_type === 'Asset') {
      return assets.find((a) => a.id === doc.related_id)?.name || 'Unknown Asset'
    }
    return entities.find((e) => e.id === doc.related_id)?.name || 'Unknown Entity'
  }

  const filteredDocuments = documents.filter((doc) => {
    if (filter !== 'All' && doc.related_type !== filter) return false
    if (statusFilter !== 'All' && doc.status !== statusFilter) return false
    return true
  })

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 lg:mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900">Document Vault</h3>
        <button className="flex items-center gap-2 px-3 py-2 lg:py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation w-full sm:w-auto justify-center">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3 lg:mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-sm border border-slate-300 rounded px-3 py-2.5 lg:py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="All">All Types</option>
          <option value="Asset">Assets</option>
          <option value="Entity">Entities</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="text-sm border border-slate-300 rounded px-3 py-2.5 lg:py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        >
          <option value="All">All Status</option>
          <option value="Verified">Verified</option>
          <option value="Missing">Missing</option>
          <option value="Expiring Soon">Expiring Soon</option>
        </select>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No documents found</p>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`border rounded-lg p-3 flex items-center justify-between ${getStatusColor(doc.status)}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(doc.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs opacity-75">
                    {doc.type} • {getRelatedName(doc)} • {doc.related_type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{doc.status}</span>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

