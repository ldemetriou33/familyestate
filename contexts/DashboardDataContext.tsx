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
      const dashboardData = await getDashboardData()
      setData(dashboardData)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch data'))
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

