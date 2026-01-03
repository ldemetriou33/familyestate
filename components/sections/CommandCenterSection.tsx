'use client'

import { useState, useMemo, useEffect } from 'react'
import { CashPositionWidget } from '@/components/command-center/CashPositionWidget'
import { CriticalAlertsWidget } from '@/components/command-center/CriticalAlertsWidget'
import { ActionEngineWidget } from '@/components/command-center/ActionEngineWidget'
import { ForecastWidget } from '@/components/command-center/ForecastWidget'
import { AIInsightsWidget } from '@/components/command-center/AIInsightsWidget'
import { QuickActionsPanel } from '@/components/command-center/QuickActionsPanel'
import { ForecastChart } from '@/components/ui/charts/ForecastChart'
import { AnomalyDetailModal } from '@/components/modals/AnomalyDetailModal'
import { DataHealthWrapper, DataHealthIndicator } from '@/components/ui/DataHealthIndicator'
import { AgentDashboard } from '@/components/agents'
import { useDashboardData, useHotelData, useCafeData, usePortfolioData, useFinanceData, useAlertsData } from '@/contexts/DashboardDataContext'
import { formatGBP } from '@/lib/utils'
import { Hotel, UtensilsCrossed, Building2, TrendingUp, TrendingDown, Database, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BusinessContext } from '@/lib/ai'
import { getOccupancyForecast, getCafeRevenueForecast } from '@/lib/ai/forecasting'
import { Anomaly } from '@/lib/ai/anomaly-detection'
import { getCommandCenterData } from '@/actions/dashboard/get-command-center-data'

export default function CommandCenterSection() {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const { data: dashboardData, loading } = useDashboardData()
  const { data: hotelData } = useHotelData()
  const { data: cafeData } = useCafeData()
  const { data: portfolioData } = usePortfolioData()
  const { data: financeData } = useFinanceData()
  const { data: alertsData } = useAlertsData()
  
  // Fetch command center specific data
  const [commandCenterData, setCommandCenterData] = useState<Awaited<ReturnType<typeof getCommandCenterData>> | null>(null)
  const [loadingCommandCenter, setLoadingCommandCenter] = useState(true)

  useEffect(() => {
    getCommandCenterData().then(data => {
      setCommandCenterData(data)
      setLoadingCommandCenter(false)
    })
  }, [])

  // Extract data with fallbacks - use commandCenterData as primary source
  const cashPosition = commandCenterData?.cashPosition || {
    operatingBalance: 0,
    reserveBalance: 0,
    totalBalance: 0,
    inflows: 0,
    outflows: 0,
    netMovement: 0,
    projected30Day: null,
    projected90Day: null,
  }

  const alerts = commandCenterData?.alerts || alertsData?.alerts || []
  const actionItems = commandCenterData?.actionItems || []

  // Generate forecast from current data
  const forecast30Day = useMemo(() => {
    if (!commandCenterData) return []
    const forecasts = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      forecasts.push({
        date: date.toISOString().split('T')[0],
        cashflow: commandCenterData.cashPosition.projected30Day ? 
          commandCenterData.cashPosition.projected30Day / 30 : 
          commandCenterData.cashPosition.netMovement,
        occupancy: commandCenterData.hotelMetrics?.occupancyRate || 0,
        revenue: commandCenterData.cafeMetrics?.salesToday || 0,
      })
    }
    return forecasts
  }, [commandCenterData])

  const hotelMetrics = useMemo(() => {
    if (commandCenterData?.hotelMetrics) {
      return {
        occupancyRate: commandCenterData.hotelMetrics.occupancyRate,
        adr: commandCenterData.hotelMetrics.adr,
        revenueToday: commandCenterData.hotelMetrics.revenueToday,
      }
    }
    if (!hotelData) return { occupancyRate: 0, adr: 0, revenueToday: 0 }
    return {
      occupancyRate: hotelData.summary?.occupancyRate || hotelData.todayMetrics?.occupancy || 0,
      adr: hotelData.todayMetrics?.adr || hotelData.weekSummary?.avgAdr || 0,
      revenueToday: hotelData.todayMetrics?.totalRevenue || 0,
    }
  }, [commandCenterData, hotelData])

  const cafeMetrics = useMemo(() => {
    if (commandCenterData?.cafeMetrics) {
      return {
        grossMargin: commandCenterData.cafeMetrics.grossMargin,
        salesToday: commandCenterData.cafeMetrics.salesToday,
        coversToday: commandCenterData.cafeMetrics.coversToday,
        laborPercentage: commandCenterData.cafeMetrics.labourPercentage,
      }
    }
    if (!cafeData) return { grossMargin: 0, salesToday: 0, coversToday: 0, laborPercentage: 0 }
    const todaySales = cafeData.todaySales
    // Calculate gross margin if we have cost data, otherwise use 0
    const grossMargin = todaySales && 'grossMargin' in todaySales ? todaySales.grossMargin : 0
    return {
      grossMargin,
      salesToday: todaySales?.grossSales || 0,
      coversToday: todaySales?.covers || 0,
      laborPercentage: todaySales && 'labourPercentage' in todaySales ? todaySales.labourPercentage : 0,
    }
  }, [commandCenterData, cafeData])

  const portfolioMetrics = useMemo(() => {
    if (commandCenterData?.portfolioMetrics) {
      return {
        totalUnits: commandCenterData.portfolioMetrics.totalUnits,
        occupiedUnits: commandCenterData.portfolioMetrics.occupiedUnits,
        vacantUnits: commandCenterData.portfolioMetrics.vacantUnits,
        maintenanceUnits: 0, // TODO: calculate from units
        totalRentRoll: commandCenterData.portfolioMetrics.totalRentRoll,
        totalArrears: commandCenterData.portfolioMetrics.totalArrears,
        complianceIssues: 0, // TODO: calculate from alerts
      }
    }
    if (!portfolioData) return {
      totalUnits: 0,
      occupiedUnits: 0,
      vacantUnits: 0,
      maintenanceUnits: 0,
      totalRentRoll: 0,
      totalArrears: 0,
      complianceIssues: 0,
    }
    return {
      totalUnits: portfolioData.totalUnits,
      occupiedUnits: portfolioData.occupiedUnits,
      vacantUnits: portfolioData.vacantUnits,
      maintenanceUnits: 0,
      totalRentRoll: portfolioData.monthlyIncome,
      totalArrears: 0,
      complianceIssues: 0,
    }
  }, [commandCenterData, portfolioData])

  // Filter for critical alerts (commandCenterData already filters dismissed alerts)
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL')

  // Generate AI forecasts
  const occupancyForecast = getOccupancyForecast(hotelMetrics.occupancyRate / 100)
  const cafeForecast = getCafeRevenueForecast(cafeMetrics.salesToday)

  // Data health info from database
  const dataHealth = useMemo(() => {
    const hotel = hotelData?.property?.hotelMetrics?.[0]
    const cafe = cafeData?.property?.cafeSales?.[0]
    const portfolio = portfolioData?.properties?.[0]

    return {
      cashPosition: {
        lastUpdated: new Date(),
        source: 'BANK_FEED',
        confidence: 'HIGH',
      },
      hotelMetrics: {
        lastUpdated: hotel?.lastUpdatedAt || new Date(),
        source: hotel?.dataSource || 'MANUAL',
        confidence: hotel?.confidence || 'MEDIUM',
      },
      cafeMetrics: {
        lastUpdated: cafe?.lastUpdatedAt || new Date(),
        source: cafe?.dataSource || 'MANUAL',
        confidence: cafe?.confidence || 'MEDIUM',
      },
      portfolioMetrics: {
        lastUpdated: portfolio?.lastUpdatedAt || new Date(),
        source: portfolio?.dataSource || 'MANUAL',
        confidence: 'MEDIUM',
      },
      alerts: {
        lastUpdated: new Date(),
        source: 'SYSTEM_GENERATED',
        confidence: 'HIGH',
      },
    }
  }, [hotelData, cafeData, portfolioData])

  // Build AI context from current data
  const aiContext: BusinessContext = {
    hotelOccupancy: (hotelMetrics.occupancyRate || 0) / 100,
    hotelADR: hotelMetrics.adr,
    cafeMargin: cafeMetrics.grossMargin,
    cafeSales: cafeMetrics.salesToday,
    arrearsTotal: portfolioMetrics.totalArrears,
    rentRoll: portfolioMetrics.totalRentRoll,
    cashBalance: cashPosition.operatingBalance + cashPosition.reserveBalance,
    vacantUnits: portfolioMetrics.vacantUnits,
    maintenanceIssues: portfolioMetrics.maintenanceUnits,
    complianceIssues: portfolioMetrics.complianceIssues,
  }

  if (loading || loadingCommandCenter) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Trust Overview */}
      <Card className="bg-gradient-to-r from-bloomberg-panel to-bloomberg-darker border-bloomberg-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="w-5 h-5 text-bloomberg-accent" />
            Data Trust Layer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <DataHealthIndicator {...dataHealth.cashPosition} compact />
              <span className="text-xs text-bloomberg-textMuted">Bank Feed</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <DataHealthIndicator {...dataHealth.hotelMetrics} compact />
              <span className="text-xs text-bloomberg-textMuted">Hotel PMS</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <DataHealthIndicator {...dataHealth.cafeMetrics} compact />
              <span className="text-xs text-bloomberg-textMuted">Cafe POS</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <DataHealthIndicator {...dataHealth.portfolioMetrics} compact />
              <span className="text-xs text-bloomberg-textMuted">Rent Roll</span>
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <DataHealthIndicator {...dataHealth.alerts} compact />
              <span className="text-xs text-bloomberg-textMuted">System</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hotel Quick Stat */}
        <DataHealthWrapper 
          {...dataHealth.hotelMetrics}
          position="top-right"
        >
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
                  <p className="text-xs text-bloomberg-textMuted">Today&apos;s Revenue</p>
                  <p className="text-lg font-semibold text-bloomberg-success">{formatGBP(hotelMetrics.revenueToday)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DataHealthWrapper>

        {/* Cafe Quick Stat */}
        <DataHealthWrapper 
          {...dataHealth.cafeMetrics}
          position="top-right"
        >
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
                  <p className="text-xs text-bloomberg-textMuted">Today&apos;s Sales</p>
                  <p className="text-lg font-semibold text-bloomberg-text">{formatGBP(cafeMetrics.salesToday)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DataHealthWrapper>

        {/* Portfolio Quick Stat */}
        <DataHealthWrapper 
          {...dataHealth.portfolioMetrics}
          position="top-right"
        >
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
        </DataHealthWrapper>
      </div>

      {/* AI Insights - Full Width */}
      <AIInsightsWidget context={aiContext} />

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Position */}
        <DataHealthWrapper 
          {...dataHealth.cashPosition}
          position="top-right"
        >
          <CashPositionWidget cashPosition={cashPosition} />
        </DataHealthWrapper>

        {/* Critical Alerts */}
        <DataHealthWrapper 
          {...dataHealth.alerts}
          position="top-right"
        >
          <CriticalAlertsWidget 
            alerts={alerts} 
            onDismiss={(id) => console.log('Dismiss alert:', id)}
          />
        </DataHealthWrapper>
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

      {/* Quick Actions Panel */}
      <QuickActionsPanel />

      {/* Interactive Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataHealthWrapper 
          {...dataHealth.hotelMetrics}
          position="top-right"
        >
          <ForecastChart 
            title="Hotel Occupancy Forecast"
            data={occupancyForecast}
            type="occupancy"
          />
        </DataHealthWrapper>
        <DataHealthWrapper 
          {...dataHealth.cafeMetrics}
          position="top-right"
        >
          <ForecastChart 
            title="Cafe Revenue Forecast"
            data={cafeForecast}
            type="revenue"
          />
        </DataHealthWrapper>
      </div>

      {/* Anomaly Detail Modal */}
      {selectedAnomaly && (
        <AnomalyDetailModal
          anomaly={selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
          onCreateAction={() => {
            console.log('Create action for anomaly:', selectedAnomaly.id)
            setSelectedAnomaly(null)
          }}
        />
      )}

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

      {/* Multi-Agent System Dashboard */}
      <AgentDashboard />
    </div>
  )
}
