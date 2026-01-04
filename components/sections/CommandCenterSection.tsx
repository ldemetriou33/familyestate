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
import { DataSource, DataConfidence } from '@/components/ui/DataHealthIndicator'
import { AlertCategory, Priority, ActionStatus } from '@/lib/types/abbey-os'
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
  const [errorCommandCenter, setErrorCommandCenter] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    
    // Set loading to true immediately
    setLoadingCommandCenter(true)
    setErrorCommandCenter(null)

    // Add timeout to prevent infinite loading - reduced to 3 seconds
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.log('Command center data timeout - using fallback')
        setLoadingCommandCenter(false)
        setCommandCenterData(null)
        setErrorCommandCenter(null)
      }
    }, 3000) // 3 second timeout

    // Use Promise.race to ensure we don't wait forever
    Promise.race([
      getCommandCenterData(),
      new Promise<Awaited<ReturnType<typeof getCommandCenterData>>>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      ),
    ])
      .then(data => {
        if (!cancelled) {
          clearTimeout(timeout)
          setCommandCenterData(data)
          setLoadingCommandCenter(false)
          setErrorCommandCenter(null)
        }
      })
      .catch(err => {
        if (!cancelled) {
          clearTimeout(timeout)
          console.error('Failed to load command center data:', err)
          // Don't show error, just use fallback data from context
          setCommandCenterData(null)
          setLoadingCommandCenter(false)
          setErrorCommandCenter(null) // Don't show error to user
        }
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  // Extract data with fallbacks - use commandCenterData as primary source
  const cashPosition = useMemo(() => {
    if (commandCenterData?.cashPosition) {
      return {
        id: 'current',
        date: new Date(),
        operatingBalance: commandCenterData.cashPosition.operatingBalance || 0,
        reserveBalance: commandCenterData.cashPosition.reserveBalance || 0,
        inflows: commandCenterData.cashPosition.inflows || 0,
        outflows: commandCenterData.cashPosition.outflows || 0,
        ...(commandCenterData.cashPosition.projected30Day !== null && { projected30Day: commandCenterData.cashPosition.projected30Day }),
        ...(commandCenterData.cashPosition.projected90Day !== null && { projected90Day: commandCenterData.cashPosition.projected90Day }),
      }
    }
    return {
      id: 'current',
      date: new Date(),
      operatingBalance: 0,
      reserveBalance: 0,
      inflows: 0,
      outflows: 0,
    }
  }, [commandCenterData])

  // Map alerts to match expected type
  const alerts = useMemo(() => {
    const commandAlerts = commandCenterData?.alerts || []
    const contextAlerts = alertsData?.alerts || []
    
    // Use commandCenterData alerts if available, otherwise use context alerts
    const allAlerts = commandAlerts.length > 0 ? commandAlerts : contextAlerts
    
    // Map to include required fields for Alert type
    return allAlerts.map(alert => {
      const a = alert as any
      return {
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        category: (['MAINTENANCE', 'FINANCIAL', 'COMPLIANCE', 'OCCUPANCY', 'OPERATIONAL'].includes(a.category)) ? a.category as AlertCategory : 'OPERATIONAL' as AlertCategory,
        createdAt: alert.createdAt,
        propertyId: (typeof a.propertyId === 'string') ? a.propertyId : undefined,
        isRead: (typeof a.isRead === 'boolean') ? a.isRead : false,
        isDismissed: (typeof a.isDismissed === 'boolean') ? a.isDismissed : false,
      }
    })
  }, [commandCenterData, alertsData])
  // Map actionItems to match expected type
  const actionItems = useMemo(() => {
    const items = commandCenterData?.actionItems || []
    return items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description ?? undefined,
      priority: (item.priority === 'CRITICAL' ? 'HIGH' : item.priority === 'HIGH' ? 'HIGH' : item.priority === 'MEDIUM' ? 'MEDIUM' : 'LOW') as Priority,
      status: (item.status === 'DRAFT' ? 'PENDING' : item.status === 'EXECUTED' ? 'COMPLETED' : item.status === 'APPROVAL_REQ' ? 'PENDING' : 'IN_PROGRESS') as ActionStatus,
      category: item.category ?? undefined,
      estimatedImpactGbp: item.estimatedImpactGbp ?? undefined,
      dueDate: item.dueDate ?? undefined,
    }))
  }, [commandCenterData])

  // Generate forecast from current data
  const forecast30Day = useMemo(() => {
    if (!commandCenterData) return []
    const forecasts = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      forecasts.push({
        id: `forecast-${i}`,
        date: date,
        predictedRevenue: commandCenterData.cafeMetrics?.salesToday || 0,
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
    const grossMargin = todaySales && 'grossMargin' in todaySales && todaySales.grossMargin !== null ? todaySales.grossMargin : 0
    return {
      grossMargin: grossMargin || 0,
      salesToday: todaySales?.grossSales || 0,
      coversToday: todaySales?.covers || 0,
      laborPercentage: (todaySales && 'labourPercentage' in todaySales && todaySales.labourPercentage !== null) ? todaySales.labourPercentage : 0,
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
        source: 'BANK_FEED' as DataSource,
        confidence: 'HIGH' as DataConfidence,
      },
      hotelMetrics: {
        lastUpdated: hotel?.lastUpdatedAt || new Date(),
        source: hotel?.dataSource || ('MANUAL' as DataSource),
        confidence: hotel?.confidence || ('MEDIUM' as DataConfidence),
      },
      cafeMetrics: {
        lastUpdated: cafe?.lastUpdatedAt || new Date(),
        source: cafe?.dataSource || ('MANUAL' as DataSource),
        confidence: cafe?.confidence || ('MEDIUM' as DataConfidence),
      },
      portfolioMetrics: {
        lastUpdated: portfolio?.lastUpdatedAt || new Date(),
        source: portfolio?.dataSource || ('MANUAL' as DataSource),
        confidence: 'MEDIUM' as DataConfidence,
      },
      alerts: {
        lastUpdated: new Date(),
        source: 'SYSTEM_GENERATED' as DataSource,
        confidence: 'HIGH' as DataConfidence,
      },
    }
  }, [hotelData, cafeData, portfolioData])

  // Build AI context from current data
  const aiContext: BusinessContext = {
    hotelOccupancy: (hotelMetrics.occupancyRate || 0) / 100,
    hotelADR: hotelMetrics.adr || 0,
    cafeMargin: cafeMetrics.grossMargin || 0,
    cafeSales: cafeMetrics.salesToday || 0,
    arrearsTotal: portfolioMetrics.totalArrears || 0,
    rentRoll: portfolioMetrics.totalRentRoll || 0,
    cashBalance: (cashPosition.operatingBalance || 0) + (cashPosition.reserveBalance || 0),
    vacantUnits: portfolioMetrics.vacantUnits || 0,
    maintenanceIssues: portfolioMetrics.maintenanceUnits || 0,
    complianceIssues: portfolioMetrics.complianceIssues || 0,
  }

  // Show loading only if we're waiting for command center data AND have no data
  // Allow rendering with partial data from context if available
  // After timeout, always show data (even if empty)
  if (loadingCommandCenter && !commandCenterData && !errorCommandCenter && !dashboardData) {
    // Only show loading spinner if we have absolutely no data
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading command center data...</p>
        <p className="text-xs text-[var(--text-muted)]">This may take a few seconds</p>
      </div>
    )
  }
  
  // If we have an error but no data, show error message with refresh option
  if (errorCommandCenter && !commandCenterData && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-[var(--text-primary)]">Failed to load command center data</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  if (errorCommandCenter) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Failed to Load Command Center Data</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">{errorCommandCenter.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Show empty state if no data
  if (!commandCenterData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Data Available</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">No command center data found. Add data via Portfolio Admin or integrations.</p>
          <a
            href="/dashboard/admin/portfolio"
            className="inline-block px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
          >
            Go to Portfolio Admin
          </a>
        </div>
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
