'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EstateAsset, AssetStatus, AssetTier } from '@/lib/types/estate-state'
import { formatGBP, formatEUR } from '@/lib/utils'

interface EditAssetModalProps {
  asset: EstateAsset | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updates: Partial<EstateAsset>) => void
}

const formatCurrency = (amount: number, currency: string) => {
  if (currency === 'GBP') return formatGBP(amount)
  if (currency === 'EUR') return formatEUR(amount)
  if (currency === 'USD') return `$${amount.toLocaleString()}`
  return amount.toLocaleString()
}

export default function EditAssetModal({ asset, open, onOpenChange, onSave }: EditAssetModalProps) {
  const [formData, setFormData] = useState<Partial<EstateAsset>>({})

  useEffect(() => {
    if (asset) {
      setFormData({
        value: asset.value,
        debt: asset.debt,
        owner_dad_pct: asset.owner_dad_pct,
        owner_uncle_pct: asset.owner_uncle_pct,
        owner_uncle_a_pct: asset.owner_uncle_a_pct,
        owner_uncle_b_pct: asset.owner_uncle_b_pct,
        legal_title: asset.legal_title,
        beneficial_interest_pct: asset.beneficial_interest_pct,
        status: asset.status,
        tier: asset.tier,
      })
    }
  }, [asset])

  if (!asset) return null

  const handleSave = () => {
    if (!asset) return
    onSave(asset.id, formData)
    onOpenChange(false)
  }

  const netValue = formData.value! - (formData.debt || 0)
  const principalEquity = (netValue * (formData.owner_dad_pct || 0)) / 100
  const minorityEquity = (netValue * (formData.owner_uncle_pct || 0)) / 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] lg:w-full my-4">
        <DialogHeader>
          <DialogTitle>Edit Asset: {asset.name}</DialogTitle>
          <DialogDescription>
            Update the asset details. Changes will be reflected immediately in the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Valuation & Debt */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">Valuation</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {asset.currency === 'GBP' ? '£' : asset.currency === 'EUR' ? '€' : '$'}
                </span>
                <Input
                  id="value"
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Current: {formatCurrency(asset.value, asset.currency)}
              </p>
            </div>

            <div>
              <Label htmlFor="debt">Debt</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {asset.currency === 'GBP' ? '£' : asset.currency === 'EUR' ? '€' : '$'}
                </span>
                <Input
                  id="debt"
                  type="number"
                  value={formData.debt || ''}
                  onChange={(e) => setFormData({ ...formData, debt: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Current: {formatCurrency(asset.debt, asset.currency)}
              </p>
            </div>
          </div>

          {/* Ownership */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="owner_dad_pct">John Demetriou Ownership (%)</Label>
              <Input
                id="owner_dad_pct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.owner_dad_pct || ''}
                onChange={(e) =>
                  setFormData({ ...formData, owner_dad_pct: Number(e.target.value) })
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                Equity: {formatCurrency(principalEquity, asset.currency)}
              </p>
            </div>

            <div>
              <Label htmlFor="owner_uncle_pct">Others Ownership (%)</Label>
              <Input
                id="owner_uncle_pct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.owner_uncle_pct || ''}
                onChange={(e) =>
                  setFormData({ ...formData, owner_uncle_pct: Number(e.target.value) })
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                Equity: {formatCurrency(minorityEquity, asset.currency)}
              </p>
            </div>
          </div>

          {/* Granular Ownership Splits */}
          {(asset.owner_uncle_a_pct !== undefined || asset.owner_uncle_b_pct !== undefined || asset.legal_title || asset.beneficial_interest_pct !== undefined) && (
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
              {asset.owner_uncle_a_pct !== undefined && (
                <div>
                  <Label htmlFor="owner_uncle_a_pct">Uncle A Ownership (%)</Label>
                  <Input
                    id="owner_uncle_a_pct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.owner_uncle_a_pct ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_uncle_a_pct: Number(e.target.value) })
                    }
                  />
                </div>
              )}
              {asset.owner_uncle_b_pct !== undefined && (
                <div>
                  <Label htmlFor="owner_uncle_b_pct">Uncle B Ownership (%)</Label>
                  <Input
                    id="owner_uncle_b_pct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.owner_uncle_b_pct ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_uncle_b_pct: Number(e.target.value) })
                    }
                  />
                </div>
              )}
              {asset.legal_title && (
                <div>
                  <Label htmlFor="legal_title">Legal Title</Label>
                  <Input
                    id="legal_title"
                    type="text"
                    value={formData.legal_title ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, legal_title: e.target.value })
                    }
                  />
                </div>
              )}
              {asset.beneficial_interest_pct !== undefined && (
                <div>
                  <Label htmlFor="beneficial_interest_pct">Beneficial Interest (%)</Label>
                  <Input
                    id="beneficial_interest_pct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.beneficial_interest_pct ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, beneficial_interest_pct: Number(e.target.value) })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Status & Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || asset.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as AssetStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leased">Leased</SelectItem>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="Renovation">Renovation</SelectItem>
                  <SelectItem value="Strategic Hold">Strategic Hold</SelectItem>
                  <SelectItem value="For Sale">For Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tier">Tier</Label>
              <Select
                value={formData.tier || asset.tier}
                onValueChange={(value) => setFormData({ ...formData, tier: value as AssetTier })}
              >
                <SelectTrigger id="tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Value-Add">Value-Add</SelectItem>
                  <SelectItem value="Opportunistic">Opportunistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Net Value</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(netValue, asset.currency)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">John Demetriou Equity</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(principalEquity, asset.currency)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Others Equity</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(minorityEquity, asset.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] lg:min-h-0 touch-manipulation"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="min-h-[44px] lg:min-h-0 touch-manipulation"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

