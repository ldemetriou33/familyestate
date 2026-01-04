/**
 * Abbey OS - Wembley Event Tracker Hook
 * Mock API hook that toggles "Event Mode" pricing
 */

import { useState, useEffect, useCallback } from 'react'

export interface WembleyEvent {
  id: string
  date: string // ISO date
  name: string
  isActive: boolean
}

/**
 * Mock Wembley events data
 * In production, this would fetch from Wembley Stadium API
 */
const MOCK_EVENTS: WembleyEvent[] = [
  {
    id: '1',
    date: '2026-02-15',
    name: 'FA Cup Semi-Final',
    isActive: true,
  },
  {
    id: '2',
    date: '2026-03-20',
    name: 'Champions League Quarter-Final',
    isActive: true,
  },
  {
    id: '3',
    date: '2026-04-10',
    name: 'Premier League Match',
    isActive: true,
  },
  {
    id: '4',
    date: '2026-05-25',
    name: 'FA Cup Final',
    isActive: true,
  },
]

export function useWembleyEvents() {
  const [events, setEvents] = useState<WembleyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [eventModeActive, setEventModeActive] = useState(false)

  useEffect(() => {
    // Simulate API call
    const fetchEvents = async () => {
      setLoading(true)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Check if today has an event
      const today = new Date().toISOString().split('T')[0]
      const todayEvent = MOCK_EVENTS.find((e) => e.date === today)
      
      setEvents(MOCK_EVENTS)
      setEventModeActive(!!todayEvent)
      setLoading(false)
    }

    fetchEvents()
  }, [])

  /**
   * Check if event mode is active for a specific date
   */
  const isEventDate = useCallback((date: string): boolean => {
    return events.some((e) => e.date === date && e.isActive)
  }, [events])

  /**
   * Get events in a date range
   */
  const getEventsInRange = useCallback((startDate: string, endDate: string): WembleyEvent[] => {
    return events.filter(
      (e) => e.date >= startDate && e.date <= endDate && e.isActive
    )
  }, [events])

  /**
   * Calculate projected revenue for a month
   */
  const calculateMonthlyRevenue = useCallback((
    normalPrice: number,
    eventPrice: number,
    spaces: number
  ): number => {
    if (!events.length) return normalPrice * spaces * 30 // Fallback if events not loaded
    
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    let totalRevenue = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const isEvent = events.some((e) => e.date === dateStr && e.isActive)

      const dailyRevenue = isEvent
        ? eventPrice * spaces
        : normalPrice * spaces

      totalRevenue += dailyRevenue
    }

    return totalRevenue
  }, [events])

  return {
    events,
    loading,
    eventModeActive,
    isEventDate,
    getEventsInRange,
    calculateMonthlyRevenue,
  }
}
