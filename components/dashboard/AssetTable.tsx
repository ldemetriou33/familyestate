'use client'

import { Building2, Eye } from 'lucide-react'
import type { SovereignAsset } from '@/lib/data/sovereign-seed'
import { formatGBP, formatEUR } from '@/lib/utils'
import Link from 'next/link'

interface AssetTableProps {
  assets: SovereignAsset[]
}

export default function AssetTable({ assets }: AssetTableProps) {
  const getAssetClass = (asset: SovereignAsset): string => {
    if (asset.id.includes('hotel') || asset.id.includes('cafe')) return 'Commercial'
    if (asset.id.includes('land')) return 'Land'
    return 'Residential'
  }

  const getAssetCategory = (tier: string): string => {
    switch (tier) {
      case 'S':
        return 'Core'
      case 'A':
        return 'Core'
      case 'B':
        return 'Value-Add'
      case 'C':
        return 'Opportunistic'
      default:
        return 'Other'
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      LEASED: { label: 'Leased', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      OPERATIONAL: { label: 'Operational', className: 'bg-green-100 text-green-700 border-green-200' },
      STRATEGIC_HOLD: { label: 'Strategic Hold', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      RENOVATION: { label: 'Renovation', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      PRUNE: { label: 'For Sale', className: 'bg-red-100 text-red-700 border-red-200' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
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

  const formatCurrency = (asset: SovereignAsset) =>
    asset.currency === 'GBP' ? formatGBP : formatEUR

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Asset Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Class
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
              const netValue = asset.valuation - (asset.debt?.principal || 0)
              const principalEquity = (netValue * asset.ownership.dad) / 100
              const minorityEquity = (netValue * asset.ownership.uncles) / 100

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
                    <span className="text-sm text-slate-600">{getAssetClass(asset)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{getAssetCategory(asset.tier)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(asset)(asset.valuation)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {asset.debt ? (
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(asset)(asset.debt.principal)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-slate-600">
                        Principal: <span className="font-medium">{asset.ownership.dad}%</span>
                      </span>
                      {asset.ownership.uncles > 0 && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-slate-600">
                            Minority: <span className="font-medium">{asset.ownership.uncles}%</span>
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(asset.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

