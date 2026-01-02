'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Theme types
export type Theme = 'dark' | 'light'
export type Density = 'comfortable' | 'compact' | 'dense'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  density: Density
  setDensity: (density: Density) => void
  autoRefreshInterval: number
  setAutoRefreshInterval: (interval: number) => void
  notifications: NotificationSettings
  setNotifications: (settings: NotificationSettings) => void
}

interface NotificationSettings {
  criticalAlerts: boolean
  warningAlerts: boolean
  emailNotifications: boolean
  quietHours: boolean
  quietStart: string
  quietEnd: string
}

const defaultNotifications: NotificationSettings = {
  criticalAlerts: true,
  warningAlerts: true,
  emailNotifications: false,
  quietHours: true,
  quietStart: '22:00',
  quietEnd: '07:00',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [density, setDensityState] = useState<Density>('comfortable')
  const [autoRefreshInterval, setAutoRefreshIntervalState] = useState<number>(300000) // 5 minutes
  const [notifications, setNotificationsState] = useState<NotificationSettings>(defaultNotifications)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('abbey-theme') as Theme | null
    const savedDensity = localStorage.getItem('abbey-density') as Density | null
    const savedRefresh = localStorage.getItem('abbey-refresh-interval')
    const savedNotifications = localStorage.getItem('abbey-notifications')

    if (savedTheme) setThemeState(savedTheme)
    if (savedDensity) setDensityState(savedDensity)
    if (savedRefresh) setAutoRefreshIntervalState(parseInt(savedRefresh))
    if (savedNotifications) setNotificationsState(JSON.parse(savedNotifications))
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return
    
    document.documentElement.classList.remove('theme-dark', 'theme-light')
    document.documentElement.classList.add(`theme-${theme}`)
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('abbey-theme', theme)
  }, [theme, mounted])

  // Apply density to document
  useEffect(() => {
    if (!mounted) return
    
    document.documentElement.classList.remove('density-comfortable', 'density-compact', 'density-dense')
    document.documentElement.classList.add(`density-${density}`)
    localStorage.setItem('abbey-density', density)
  }, [density, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity)
  }

  const setAutoRefreshInterval = (interval: number) => {
    setAutoRefreshIntervalState(interval)
    localStorage.setItem('abbey-refresh-interval', interval.toString())
  }

  const setNotifications = (settings: NotificationSettings) => {
    setNotificationsState(settings)
    localStorage.setItem('abbey-notifications', JSON.stringify(settings))
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      density,
      setDensity,
      autoRefreshInterval,
      setAutoRefreshInterval,
      notifications,
      setNotifications,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

