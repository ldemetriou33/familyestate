'use client'

import { useState } from 'react'
import { Building2, Eye, Edit } from 'lucide-react'
import type { EstateAsset } from '@/lib/types/estate-state'
import { formatGBP, formatEUR } from '@/lib/utils'
import EditAssetModal from './EditAssetModal'
import OwnershipTooltip from './OwnershipTooltip'

interface DynamicAssetTableProps {
  assets: EstateAsset[]
  onUpdateAsset: (id: string, updates: Partial<EstateAsset>) => void
}

export default function DynamicAssetTable({ assets, onUpdateAsset }: DynamicAssetTableProps) {
  const [editingAsset, setEditingAsset] = useState<EstateAsset | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEdit = (asset: EstateAsset) => {
    setEditingAsset(asset)
    setIsModalOpen(true)
  }

  const handleSave = (id: string, updates: Partial<EstateAsset>) => {
    onUpdateAsset(id, updates)
    setIsModalOpen(false)
    setEditingAsset(null)
  }

  const formatCurrency = (asset: EstateAsset) =>
    asset.currency === 'GBP' ? formatGBP : formatEUR

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      LEASED: { label: 'Leased', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      OPERATIONAL: { label: 'Operational', className: 'bg-green-100 text-green-700 border-green-200' },
      'Strategic Hold': {
        label: 'Strategic Hold',
        className: 'bg-purple-100 text-purple-700 border-purple-200',
      },
      Renovation: { label: 'Renovation', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'For Sale': { label: 'For Sale', className: 'bg-red-100 text-red-700 border-red-200' },
    }

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-slate-100 text-slate-700 border-slate-200',
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded border ${config.className}`}
      >
        {config.label}
      </span>
    )
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Asset Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Valuation
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Debt
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Ownership
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assets.map((asset) => {
                const netValue = asset.value - asset.debt
                const principalEquity = (netValue * asset.owner_dad_pct) / 100
                const minorityEquity = (netValue * asset.owner_uncle_pct) / 100

                return (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{asset.location}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{asset.tier}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(asset)(asset.value)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {asset.debt > 0 ? (
                        <span className="text-sm font-medium text-slate-900">
                          {formatCurrency(asset)(asset.debt)}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <OwnershipTooltip asset={asset}>
                        <div className="flex items-center justify-center gap-2 cursor-help">
                          <span className="text-xs text-slate-600">
                            Principal: <span className="font-medium">{asset.owner_dad_pct}%</span>
                          </span>
                          {asset.owner_uncle_pct > 0 && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="text-xs text-slate-600">
                                Minority: <span className="font-medium">{asset.owner_uncle_pct}%</span>
                              </span>
                            </>
                          )}
                        </div>
                      </OwnershipTooltip>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEdit(asset)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EditAssetModal
        asset={editingAsset}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />
    </>
  )
}

