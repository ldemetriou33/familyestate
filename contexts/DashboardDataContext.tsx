'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { getDashboardData } from '@/actions/dashboard/get-dashboard-data'
import { seedPortfolioData } from '@/actions/portfolio'

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

interface DashboardDataContextType {
  data: DashboardData | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  seedData: () => Promise<boolean>
  hasData: boolean
}

const DashboardDataContext = createContext<DashboardDataContextType>({
  data: null,
  loading: true,
  error: null,
  refresh: async () => {},
  seedData: async () => false,
  hasData: false,
})

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 15 seconds. Please check your database connection.')), 15000)
      })
      
      const dashboardData = await Promise.race([
        getDashboardData(),
        timeoutPromise,
      ]) as Awaited<ReturnType<typeof getDashboardData>>
      
      setData(dashboardData)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      const error = err instanceof Error ? err : new Error('Failed to fetch data')
      setError(error)
      // Set empty data structure so components can still render
      setData({
        portfolio: { totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0, occupancyRate: 0, totalValue: 0, totalDebt: 0, totalEquity: 0, monthlyIncome: 0, ltv: 0, byType: { residential: [], hotel: [], cafe: [] }, properties: [], recentTransactions: [] },
        hotel: null,
        cafe: null,
        residential: { properties: [], summary: { totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0, occupancyRate: 0, totalValue: 0, totalDebt: 0, equity: 0, monthlyRent: 0, annualYield: 0 }, alerts: { unitsInArrears: 0, totalArrears: 0, expiringLeases: 0 } },
        finance: { cashPosition: 0, cashHistory: [], totalDebt: 0, monthlyDebtService: 0, debts: [], monthlyExpenses: 0, recentExpenses: [], recentTransactions: [], upcomingPayments: [] },
        alerts: { alerts: [], counts: { critical: 0, warning: 0, info: 0 } },
        lastUpdated: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const seedData = useCallback(async () => {
    try {
      const result = await seedPortfolioData()
      if (result.success) {
        await fetchData()
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to seed data:', err)
      return false
    }
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const hasData = data !== null && data.portfolio.totalProperties > 0

  return (
    <DashboardDataContext.Provider
      value={{
        data,
        loading,
        error,
        refresh: fetchData,
        seedData,
        hasData,
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider')
  }
  return context
}

// Convenience hooks for specific data sections
export function usePortfolioData() {
  const { data, loading, hasData } = useDashboardData()
  return {
    data: data?.portfolio || null,
    loading,
    hasData: hasData && (data?.portfolio.totalProperties ?? 0) > 0,
  }
}

export function useHotelData() {
  const { data, loading, hasData } = useDashboardData()
  return {
    data: data?.hotel || null,
    loading,
    hasData: hasData && data?.hotel !== null,
  }
}

export function useCafeData() {
  const { data, loading, hasData } = useDashboardData()
  return {
    data: data?.cafe || null,
    loading,
    hasData: hasData && data?.cafe !== null,
  }
}

export function useResidentialData() {
  const { data, loading, hasData } = useDashboardData()
  return {
    data: data?.residential || null,
    loading,
    hasData: hasData && (data?.residential.properties.length ?? 0) > 0,
  }
}

export function useFinanceData() {
  const { data, loading, hasData } = useDashboardData()
  return {
    data: data?.finance || null,
    loading,
    hasData,
  }
}

export function useAlertsData() {
  const { data, loading } = useDashboardData()
  return {
    data: data?.alerts || null,
    loading,
    count: data?.alerts?.alerts.length ?? 0,
  }
}

