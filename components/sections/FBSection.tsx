'use client'

import { useState, useEffect } from 'react'
import { UtensilsCrossed, TrendingUp, DollarSign, Store, Target, Calendar, Plus } from 'lucide-react'
import { cafe } from '@/lib/constants'
import { formatGBP, formatUKDate, formatPercentage } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface DailySale {
  date: string
  amount: number
}

export default function FBSection() {
  const weeklyTarget = cafe.weeklyTarget // £15,000
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [newSaleAmount, setNewSaleAmount] = useState('')
  const [newSaleDate, setNewSaleDate] = useState('')

  // Get current week's sales
  const getCurrentWeekSales = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)

    return dailySales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate >= startOfWeek
    })
  }

  const currentWeekSales = getCurrentWeekSales()
  const currentWeekTotal = currentWeekSales.reduce((sum, sale) => sum + sale.amount, 0)
  const daysRemaining = 7 - currentWeekSales.length
  const targetRemaining = weeklyTarget - currentWeekTotal
  const dailyAverageNeeded = daysRemaining > 0 ? targetRemaining / daysRemaining : 0
  const isOnTrack = currentWeekTotal >= weeklyTarget || (daysRemaining > 0 && dailyAverageNeeded <= weeklyTarget / 7)
  const progressPercentage = Math.min((currentWeekTotal / weeklyTarget) * 100, 100)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cafe-daily-sales')
    if (saved) {
      try {
        setDailySales(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load sales data')
      }
    }
  }, [])

  // Save to localStorage when sales change
  useEffect(() => {
    localStorage.setItem('cafe-daily-sales', JSON.stringify(dailySales))
  }, [dailySales])

  const handleAddSale = () => {
    if (!newSaleAmount || !newSaleDate) return

    const amount = parseFloat(newSaleAmount)
    if (isNaN(amount) || amount <= 0) return

    setDailySales([...dailySales, { date: newSaleDate, amount }])
    setNewSaleAmount('')
    setNewSaleDate('')
  }

  // Weekly sales data for Abbey Café (last 8 weeks) - historical
  const weeklySales = [
    { week: 'Week 1', date: new Date(2024, 10, 4), sales: 15250 },
    { week: 'Week 2', date: new Date(2024, 10, 11), sales: 14800 },
    { week: 'Week 3', date: new Date(2024, 10, 18), sales: 16300 },
    { week: 'Week 4', date: new Date(2024, 10, 25), sales: 14100 },
    { week: 'Week 5', date: new Date(2024, 11, 2), sales: 15750 },
    { week: 'Week 6', date: new Date(2024, 11, 9), sales: 14900 },
    { week: 'Week 7', date: new Date(2024, 11, 16), sales: 16800 },
    { week: 'Week 8', date: new Date(2024, 11, 23), sales: 15500 },
  ]

  const averageWeeklySales =
    weeklySales.reduce((sum, week) => sum + week.sales, 0) / weeklySales.length
  const targetAchievement = (averageWeeklySales / weeklyTarget) * 100

  const metrics = [
    { label: 'Total Outlets', value: '18', change: '+3', trend: 'up', icon: Store },
    { label: 'Monthly Revenue', value: '£1.6M', change: '+8.3%', trend: 'up', icon: DollarSign },
    { label: 'Avg. Daily Covers', value: '2,847', change: '+234', trend: 'up', icon: TrendingUp },
    { label: 'Food Cost %', value: '28.5%', change: '-1.2%', trend: 'down', icon: UtensilsCrossed },
  ]

  const outlets = [
    { name: 'The Abbey Restaurant', location: 'London', type: 'Fine Dining', covers: 125, revenue: 185000, cost: 52750, margin: 71.5, status: 'Operational' },
    { name: 'Riverside Bistro', location: 'Oxford', type: 'Casual Dining', covers: 95, revenue: 125000, cost: 37500, margin: 70.0, status: 'Operational' },
    { name: 'Highland Pub', location: 'Edinburgh', type: 'Pub', covers: 180, revenue: 145000, cost: 43500, margin: 70.0, status: 'Operational' },
    { name: 'Coastal Café', location: 'Brighton', type: 'Café', covers: 65, revenue: 85000, cost: 25500, margin: 70.0, status: 'Operational' },
    { name: 'Estate Kitchen', location: 'Cotswolds', type: 'Farm-to-Table', covers: 45, revenue: 95000, cost: 28500, margin: 70.0, status: 'Operational' },
    { name: 'City Brasserie', location: 'Manchester', type: 'Brasserie', covers: 110, revenue: 165000, cost: 49500, margin: 70.0, status: 'Operational' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const isPositive = metric.trend === 'up' || (metric.label === 'Food Cost %' && metric.trend === 'down')
          
          return (
            <div
              key={index}
              className="bg-bloomberg-panel border border-bloomberg-border rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${isPositive ? 'text-bloomberg-success' : 'text-bloomberg-warning'}`} />
                <span className={`text-xs font-medium ${
                  isPositive ? 'text-bloomberg-success' : 'text-bloomberg-warning'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-sm text-bloomberg-textMuted mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-bloomberg-text">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Abbey Café Weekly Target Tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-bloomberg-accent" />
                Abbey Café - Weekly Revenue Dashboard
              </CardTitle>
              <p className="text-sm text-bloomberg-textMuted mt-1">
                {cafe.name} - {cafe.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-bloomberg-textMuted">Weekly Target</p>
              <p className="text-lg font-bold text-bloomberg-text">{formatGBP(weeklyTarget)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Current Week Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-bloomberg-text">This Week&apos;s Progress</span>
              <span className={`text-sm font-bold ${
                isOnTrack ? 'text-bloomberg-success' : 'text-bloomberg-danger'
              }`}>
                {formatGBP(currentWeekTotal)} / {formatGBP(weeklyTarget)}
              </span>
            </div>
            <div className="h-4 bg-bloomberg-darker rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  isOnTrack ? 'bg-bloomberg-success' : 'bg-bloomberg-danger'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-bloomberg-textMuted">
              <span>{formatPercentage(progressPercentage)} complete</span>
              {daysRemaining > 0 && (
                <span>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
          </div>

          {/* Daily Average Needed */}
          {daysRemaining > 0 && (
            <div className={`mb-6 p-4 rounded-lg ${
              isOnTrack ? 'bg-bloomberg-success/10 border border-bloomberg-success/20' : 'bg-bloomberg-danger/10 border border-bloomberg-danger/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className={`w-4 h-4 ${isOnTrack ? 'text-bloomberg-success' : 'text-bloomberg-danger'}`} />
                <span className="text-sm font-semibold text-bloomberg-text">
                  Daily Average Needed to Hit Target
                </span>
              </div>
              <p className={`text-2xl font-bold ${isOnTrack ? 'text-bloomberg-success' : 'text-bloomberg-danger'}`}>
                {formatGBP(dailyAverageNeeded)}
              </p>
              <p className="text-xs text-bloomberg-textMuted mt-1">
                {formatGBP(targetRemaining)} remaining over {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Add Daily Sales Input */}
          <div className="mb-6 p-4 bg-bloomberg-darker rounded-lg">
            <h4 className="text-sm font-semibold text-bloomberg-text mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Daily Sales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-bloomberg-textMuted mb-1 block">Date</label>
                <input
                  type="date"
                  value={newSaleDate}
                  onChange={(e) => setNewSaleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-sm text-bloomberg-text focus:outline-none focus:ring-2 focus:ring-bloomberg-accent"
                />
              </div>
              <div>
                <label className="text-xs text-bloomberg-textMuted mb-1 block">Sales Amount (£)</label>
                <input
                  type="number"
                  value={newSaleAmount}
                  onChange={(e) => setNewSaleAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 bg-bloomberg-panel border border-bloomberg-border rounded-lg text-sm text-bloomberg-text focus:outline-none focus:ring-2 focus:ring-bloomberg-accent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddSale}
                  className="w-full px-4 py-2 bg-bloomberg-accent hover:bg-bloomberg-accentHover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Add Sale
                </button>
              </div>
            </div>
          </div>

          {/* Current Week Sales List */}
          {currentWeekSales.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-bloomberg-text mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Week&apos;s Sales
              </h4>
              <div className="space-y-2">
                {currentWeekSales
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((sale, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-bloomberg-darker rounded-lg"
                    >
                      <span className="text-sm text-bloomberg-text">
                        {formatUKDate(new Date(sale.date))}
                      </span>
                      <span className="text-sm font-semibold text-bloomberg-success">
                        {formatGBP(sale.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Historical Weekly Performance */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-bloomberg-text mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last 8 Weeks Performance
            </h4>
            <div className="space-y-2">
              {weeklySales.map((week, index) => {
                const isAboveTarget = week.sales >= weeklyTarget
                const percentage = (week.sales / weeklyTarget) * 100
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-bloomberg-textMuted w-16">{week.week}</span>
                        <span className="text-bloomberg-textMuted text-xs">
                          {formatUKDate(week.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-mono font-semibold ${
                            isAboveTarget
                              ? 'text-bloomberg-success'
                              : 'text-bloomberg-danger'
                          }`}
                        >
                          {formatGBP(week.sales)}
                        </span>
                        <span className="text-xs text-bloomberg-textMuted w-16 text-right">
                          {formatPercentage(percentage)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-bloomberg-darker rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isAboveTarget ? 'bg-bloomberg-success' : 'bg-bloomberg-danger'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outlet Performance Table */}
      <div className="bg-bloomberg-panel border border-bloomberg-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-bloomberg-border">
          <h3 className="text-lg font-semibold text-bloomberg-text">Outlet Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bloomberg-darker">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Outlet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Daily Covers</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Monthly Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Food Cost</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Margin</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-bloomberg-textMuted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bloomberg-border">
              {outlets.map((outlet, index) => (
                <tr key={index} className="hover:bg-bloomberg-darker transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-bloomberg-text">{outlet.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-bloomberg-textMuted">{outlet.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-bloomberg-textMuted">{outlet.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-bloomberg-text">{outlet.covers}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono text-bloomberg-text">£{(outlet.revenue / 1000).toFixed(0)}K</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono text-bloomberg-text">£{(outlet.cost / 1000).toFixed(0)}K</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono text-bloomberg-success">{outlet.margin.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-bloomberg-success">{outlet.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
