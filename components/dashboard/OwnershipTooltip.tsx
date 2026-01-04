'use client'

import { useState } from 'react'
import type { EstateAsset } from '@/lib/types/estate-state'
import { formatGBP, formatEUR } from '@/lib/utils'

interface OwnershipTooltipProps {
  asset: EstateAsset
  children: React.ReactNode
}

export default function OwnershipTooltip({ asset, children }: OwnershipTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const formatCurrency = asset.currency === 'GBP' ? formatGBP : formatEUR
  const netValue = asset.value - asset.debt

  const getTooltipContent = () => {
    const details: string[] = []

    // Add granular splits if available
    if (asset.owner_uncle_a_pct !== undefined && asset.owner_uncle_b_pct !== undefined) {
      details.push(`Uncle A: ${asset.owner_uncle_a_pct}%`)
      details.push(`Uncle B: ${asset.owner_uncle_b_pct}%`)
    }

    // Add legal title if available
    if (asset.legal_title) {
      details.push(`Legal Title: ${asset.legal_title}`)
    }

    // Add beneficial interest if available
    if (asset.beneficial_interest_pct !== undefined) {
      const beneficialValue = (netValue * asset.beneficial_interest_pct) / 100
      details.push(`Beneficial Interest: ${asset.beneficial_interest_pct}% (${formatCurrency(beneficialValue)})`)
      if (asset.metadata?.note) {
        details.push(`${asset.metadata.note as string}`)
      }
    }

    return details
  }

  const tooltipContent = getTooltipContent()

  if (tooltipContent.length === 0) {
    return <>{children}</>
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-lg shadow-lg p-3">
          <div className="font-semibold mb-2">{asset.name}</div>
          <div className="space-y-1">
            {tooltipContent.map((detail, index) => (
              <div key={index} className="text-slate-200">{detail}</div>
            ))}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}
    </div>
  )
}

