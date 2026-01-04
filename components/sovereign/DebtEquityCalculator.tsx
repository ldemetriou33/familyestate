'use client'

import { useState } from 'react'
import { Calculator, DollarSign, TrendingUp, FileText } from 'lucide-react'
import { seedEstateData } from '@/lib/data/estate-seed'
import { calculateDebtEquitySwap, calculateEntityDebtEquitySwap } from '@/lib/calculations/debt-equity-swap'
import type { DebtEquitySwap, Asset } from '@/lib/types/estate'
import { formatGBP } from '@/lib/utils'

export default function DebtEquityCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('200000')
  const [currency, setCurrency] = useState<'GBP' | 'EUR' | 'USD'>('GBP')
  const [targetEntity, setTargetEntity] = useState<'MAD_LTD' | 'DEM_BRO_LTD' | 'CYPRUS_COMPANY'>('MAD_LTD')
  const [targetAssetId, setTargetAssetId] = useState<string>('')
  const [results, setResults] = useState<DebtEquitySwap[]>([])

  const portfolio = seedEstateData()
  const entityAssets = portfolio.assets.filter((a) => a.ownership.entity === targetEntity)

  const handleCalculate = () => {
    const amount = parseFloat(loanAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid loan amount')
      return
    }

    let swaps: DebtEquitySwap[] = []

    if (targetAssetId) {
      // Calculate for specific asset
      const asset = portfolio.assets.find((a) => a.id === targetAssetId)
      if (asset) {
        const swap = calculateDebtEquitySwap(
          amount,
          currency,
          asset,
          asset.ownership.dad_share
        )
        swaps = [swap]
      }
    } else {
      // Calculate for entire entity
      swaps = calculateEntityDebtEquitySwap(amount, currency, portfolio.assets, targetEntity)
    }

    setResults(swaps)
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Debt-for-Equity Swapper</h2>
        <p className="text-slate-400">Calculate how many shares/ownership % a loan can purchase</p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Loan Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="200000"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'GBP' | 'EUR' | 'USD')}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Entity</label>
            <select
              value={targetEntity}
              onChange={(e) => {
                setTargetEntity(e.target.value as 'MAD_LTD' | 'DEM_BRO_LTD' | 'CYPRUS_COMPANY')
                setTargetAssetId('') // Reset asset selection
              }}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="MAD_LTD">MAD Ltd</option>
              <option value="DEM_BRO_LTD">Dem Bro Ltd</option>
              <option value="CYPRUS_COMPANY">Cyprus Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Asset (Optional)</label>
            <select
              value={targetAssetId}
              onChange={(e) => setTargetAssetId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">All assets in entity</option>
              {entityAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Calculator className="w-5 h-5" />
          Calculate Swap
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Terms Sheet Summary</h3>
          {results.map((swap, index) => {
            const asset = portfolio.assets.find((a) => a.id === swap.target_asset_id)
            const currencySymbol = swap.currency === 'GBP' ? '£' : swap.currency === 'EUR' ? '€' : '$'

            return (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {asset?.name || 'Entity-wide'}
                    </h4>
                    <p className="text-sm text-slate-400">{swap.target_entity}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Loan Amount</p>
                    <p className="text-lg font-semibold text-white">
                      {currencySymbol}
                      {swap.loan_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Asset Valuation</p>
                    <p className="text-lg font-semibold text-white">
                      {asset?.currency === 'GBP' ? '£' : '€'}
                      {swap.current_valuation.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ownership Purchased</p>
                    <p className="text-lg font-semibold text-green-400">
                      {(swap.shares_purchased * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">New Total Ownership</p>
                    <p className="text-lg font-semibold text-amber-400">
                      {(swap.ownership_percentage_after * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                    <p className="text-sm text-slate-300 whitespace-pre-line">
                      {swap.terms_summary}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

