'use client'

import { CashPositionWidget } from '@/components/command-center/CashPositionWidget'
import { CriticalAlertsWidget } from '@/components/command-center/CriticalAlertsWidget'
import { ActionEngineWidget } from '@/components/command-center/ActionEngineWidget'
import { ForecastWidget } from '@/components/command-center/ForecastWidget'
import { 
  cashPosition, 
  alerts, 
  actionItems, 
  forecast30Day,
  hotelMetrics,
  cafeMetrics,
  portfolioMetrics 
} from '@/lib/mock-data/seed'
import { formatGBP } from '@/lib/utils'
import { Hotel, UtensilsCrossed, Building2, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function CommandCenterSection() {
  // Filter for critical alerts count
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.isDismissed)

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hotel Quick Stat */}
        <Card className="bg-gradient-to-br from-bloomberg-panel to-bloomberg-darker border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Hotel className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-bloomberg-textMuted">Hotel Occupancy</p>
                  <p className="text-2xl font-bold text-bloomberg-text">{hotelMetrics.occupancyRate}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-bloomberg-textMuted">Today's Revenue</p>
                <p className="text-lg font-semibold text-bloomberg-success">{formatGBP(hotelMetrics.revenueToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cafe Quick Stat */}
        <Card className="bg-gradient-to-br from-bloomberg-panel to-bloomberg-darker border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-bloomberg-textMuted">Cafe Margin</p>
                  <p className={`text-2xl font-bold ${cafeMetrics.grossMargin >= 60 ? 'text-bloomberg-success' : 'text-bloomberg-danger'}`}>
                    {cafeMetrics.grossMargin}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-bloomberg-textMuted">Today's Sales</p>
                <p className="text-lg font-semibold text-bloomberg-text">{formatGBP(cafeMetrics.salesToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Quick Stat */}
        <Card className="bg-gradient-to-br from-bloomberg-panel to-bloomberg-darker border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-bloomberg-textMuted">Rent Roll</p>
                  <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(portfolioMetrics.totalRentRoll)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-bloomberg-textMuted">Arrears</p>
                <p className={`text-lg font-semibold ${portfolioMetrics.totalArrears > 0 ? 'text-bloomberg-danger' : 'text-bloomberg-success'}`}>
                  {formatGBP(portfolioMetrics.totalArrears)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Position */}
        <CashPositionWidget cashPosition={cashPosition} />

        {/* Critical Alerts */}
        <CriticalAlertsWidget 
          alerts={alerts} 
          onDismiss={(id) => console.log('Dismiss alert:', id)}
        />
      </div>

      {/* Action Engine & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Engine */}
        <ActionEngineWidget 
          actions={actionItems}
          onComplete={(id) => console.log('Complete action:', id)}
        />

        {/* 30-Day Forecast */}
        <ForecastWidget forecasts={forecast30Day} />
      </div>

      {/* Portfolio Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-bloomberg-textMuted mb-1">Total Units</p>
            <p className="text-2xl font-bold text-bloomberg-text">{portfolioMetrics.totalUnits}</p>
            <div className="mt-2 flex gap-2">
              <span className="text-xs px-2 py-0.5 bg-bloomberg-success/10 text-bloomberg-success rounded">
                {portfolioMetrics.occupiedUnits} Occupied
              </span>
              <span className="text-xs px-2 py-0.5 bg-bloomberg-warning/10 text-bloomberg-warning rounded">
                {portfolioMetrics.vacantUnits} Vacant
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-bloomberg-textMuted mb-1">Hotel ADR</p>
            <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(hotelMetrics.adr)}</p>
            <div className="mt-2 flex items-center gap-1 text-bloomberg-success">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">+5% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-bloomberg-textMuted mb-1">Cafe Covers Today</p>
            <p className="text-2xl font-bold text-bloomberg-text">{cafeMetrics.coversToday}</p>
            <div className="mt-2 flex items-center gap-1 text-bloomberg-textMuted">
              <span className="text-xs">Labour: {cafeMetrics.laborPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-bloomberg-textMuted mb-1">Compliance Issues</p>
            <p className={`text-2xl font-bold ${portfolioMetrics.complianceIssues > 0 ? 'text-bloomberg-danger' : 'text-bloomberg-success'}`}>
              {portfolioMetrics.complianceIssues}
            </p>
            {portfolioMetrics.complianceIssues > 0 && (
              <div className="mt-2 flex items-center gap-1 text-bloomberg-danger">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs">Action Required</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

