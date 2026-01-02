'use client'

import { UtensilsCrossed, TrendingUp, DollarSign, Store, Target, Calendar } from 'lucide-react'
import { cafe } from '@/lib/constants'
import { formatGBP, formatUKDate, formatPercentage } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function FBSection() {
  // Weekly sales data for Abbey Café (last 8 weeks)
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

  const weeklyTarget = cafe.weeklyTarget // £15,000
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
                Abbey Café - Weekly Target Tracker
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-bloomberg-darker rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-bloomberg-textMuted" />
                <span className="text-sm text-bloomberg-textMuted">Average Weekly Sales</span>
              </div>
              <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(averageWeeklySales)}</p>
            </div>
            <div className="bg-bloomberg-darker rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-bloomberg-textMuted" />
                <span className="text-sm text-bloomberg-textMuted">Target Achievement</span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  targetAchievement >= 100
                    ? 'text-bloomberg-success'
                    : targetAchievement >= 90
                    ? 'text-bloomberg-warning'
                    : 'text-bloomberg-danger'
                }`}
              >
                {formatPercentage(targetAchievement)}
              </p>
            </div>
            <div className="bg-bloomberg-darker rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-bloomberg-textMuted" />
                <span className="text-sm text-bloomberg-textMuted">vs Target</span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  averageWeeklySales >= weeklyTarget
                    ? 'text-bloomberg-success'
                    : 'text-bloomberg-danger'
                }`}
              >
                {averageWeeklySales >= weeklyTarget ? '+' : ''}
                {formatGBP(averageWeeklySales - weeklyTarget)}
              </p>
            </div>
          </div>

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

