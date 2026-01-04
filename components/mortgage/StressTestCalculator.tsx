'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { runStressTest } from '@/app/actions/mortgage-actions'
import { toast } from 'sonner'
import { formatGBP, formatPercentage } from '@/lib/utils'
import type { Mortgage, StressTestResult } from '@/app/actions/mortgage-actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface StressTestCalculatorProps {
  mortgage: Mortgage
}

export function StressTestCalculator({ mortgage }: StressTestCalculatorProps) {
  const [scenario, setScenario] = useState({
    name: '',
    rateChange: 0,
    valuationChange: 0,
    incomeChange: 0,
  })
  const [result, setResult] = useState<StressTestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRunTest = async () => {
    if (!scenario.name) {
      toast.error('Please enter a scenario name')
      return
    }

    setLoading(true)
    try {
      const testResult = await runStressTest(mortgage.id, scenario)
      if (testResult.success) {
        setResult(testResult.data)
        toast.success('Stress test completed')
      } else {
        toast.error(testResult.error || 'Failed to run stress test')
      }
    } catch (error) {
      toast.error('Failed to run stress test')
    } finally {
      setLoading(false)
    }
  }

  const presetScenarios = [
    { name: 'Base Case', rateChange: 0, valuationChange: 0, incomeChange: 0 },
    { name: 'Rate Rise +1%', rateChange: 1, valuationChange: 0, incomeChange: 0 },
    { name: 'Rate Rise +2%', rateChange: 2, valuationChange: 0, incomeChange: 0 },
    { name: 'Valuation Drop -10%', rateChange: 0, valuationChange: -10, incomeChange: 0 },
    { name: 'Valuation Drop -20%', rateChange: 0, valuationChange: -20, incomeChange: 0 },
    { name: 'Worst Case (+2% Rate, -20% Value)', rateChange: 2, valuationChange: -20, incomeChange: 0 },
  ]

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default:
        return 'text-green-400 bg-green-500/20 border-green-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Scenario Input */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Run Stress Test</CardTitle>
          <p className="text-sm text-slate-400">
            Test how rate changes, valuation drops, or income changes affect this mortgage
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Scenario Name *</label>
            <input
              type="text"
              value={scenario.name}
              onChange={(e) => setScenario({ ...scenario, name: e.target.value })}
              placeholder="e.g., Rate Rise +2%"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rate Change (%)</label>
              <input
                type="number"
                step="0.1"
                value={scenario.rateChange}
                onChange={(e) => setScenario({ ...scenario, rateChange: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <p className="text-xs text-slate-400 mt-1">Positive = rate increase</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Valuation Change (%)</label>
              <input
                type="number"
                step="0.1"
                value={scenario.valuationChange}
                onChange={(e) => setScenario({ ...scenario, valuationChange: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <p className="text-xs text-slate-400 mt-1">Negative = value decrease</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Income Change (%)</label>
              <input
                type="number"
                step="0.1"
                value={scenario.incomeChange}
                onChange={(e) => setScenario({ ...scenario, incomeChange: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <p className="text-xs text-slate-400 mt-1">Negative = income decrease</p>
            </div>
          </div>

          {/* Preset Scenarios */}
          <div>
            <label className="block text-sm font-medium mb-2">Quick Scenarios</label>
            <div className="flex flex-wrap gap-2">
              {presetScenarios.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setScenario({ ...scenario, ...preset })}
                  className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunTest}
            disabled={loading || !scenario.name}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900" />
                Running Test...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Run Stress Test
              </>
            )}
          </button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className={`bg-slate-800 border ${getRiskColor(result.risk_level)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Test Results: {result.scenario_name}</CardTitle>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.risk_level)}`}>
                {result.risk_level} Risk
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">New Monthly Payment</p>
                <p className="text-lg font-bold text-white">
                  {formatGBP(result.new_monthly_payment)}
                </p>
                {mortgage.monthly_payment && (
                  <p className="text-xs text-slate-400 mt-1">
                    {result.new_monthly_payment > mortgage.monthly_payment ? (
                      <span className="text-red-400">
                        +{formatGBP(result.new_monthly_payment - mortgage.monthly_payment)}
                      </span>
                    ) : (
                      <span className="text-green-400">
                        {formatGBP(result.new_monthly_payment - mortgage.monthly_payment)}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">New LTV</p>
                <p className="text-lg font-bold text-white">
                  {result.new_ltv ? `${result.new_ltv.toFixed(1)}%` : '—'}
                </p>
                {mortgage.ltv_ratio && result.new_ltv && (
                  <p className="text-xs text-slate-400 mt-1">
                    {result.new_ltv > mortgage.ltv_ratio ? (
                      <span className="text-red-400">
                        +{(result.new_ltv - mortgage.ltv_ratio).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-green-400">
                        {(result.new_ltv - mortgage.ltv_ratio).toFixed(1)}%
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Debt Service Ratio</p>
                <p className="text-lg font-bold text-white">
                  {result.debt_service_ratio ? `${result.debt_service_ratio.toFixed(1)}%` : '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Can Service Debt</p>
                <div className="flex items-center gap-2">
                  {result.can_service_debt ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-lg font-bold text-white">
                    {result.can_service_debt ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {result.recommendation && (
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                <p className="text-sm font-medium text-white mb-1">Recommendation</p>
                <p className="text-sm text-slate-300">{result.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Mortgage Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Current Mortgage Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Balance</p>
              <p className="font-semibold text-white">{formatGBP(mortgage.current_balance)}</p>
            </div>
            <div>
              <p className="text-slate-400">Monthly Payment</p>
              <p className="font-semibold text-white">
                {mortgage.monthly_payment ? formatGBP(mortgage.monthly_payment) : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Interest Rate</p>
              <p className="font-semibold text-white">{formatPercentage(mortgage.interest_rate)}</p>
            </div>
            <div>
              <p className="text-slate-400">LTV</p>
              <p className="font-semibold text-white">
                {mortgage.ltv_ratio ? `${mortgage.ltv_ratio.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

