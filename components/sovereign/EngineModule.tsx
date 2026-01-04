'use client'

import { useState, useEffect } from 'react'
import { Building2, Car, Calendar, TrendingUp, Bell } from 'lucide-react'
import { seedEstateData } from '@/lib/data/estate-seed'
import { calculateEventModeYield, getWembleyEventDates } from '@/lib/calculations/event-mode'
import type { Asset, EventModeConfig } from '@/lib/types/estate'
import { formatGBP } from '@/lib/utils'

export default function EngineModule() {
  const [hotelAsset, setHotelAsset] = useState<Asset | null>(null)
  const [carParkAsset, setCarParkAsset] = useState<Asset | null>(null)
  const [eventConfig, setEventConfig] = useState<EventModeConfig | null>(null)
  const [eventDates, setEventDates] = useState<string[]>([])
  const [projectedYield, setProjectedYield] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const portfolio = seedEstateData()
      
      const hotel = portfolio.assets.find((a) => a.id === 'abbey-point-hotel')
      const carPark = portfolio.assets.find((a) => a.id === 'hotel-car-park')
      const eventMode = portfolio.event_modes.find((e) => e.asset_id === 'hotel-car-park')
      
      setHotelAsset(hotel || null)
      setCarParkAsset(carPark || null)
      setEventConfig(eventMode || null)
      
      // Load event dates (placeholder for now)
      const dates = await getWembleyEventDates()
      setEventDates(dates)
      
      // Calculate projected yield
      if (eventMode) {
        const yield_ = calculateEventModeYield(eventMode, dates)
        setProjectedYield(yield_)
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const annualLease = hotelAsset?.metadata?.lease_payment || 0
  const monthlyLease = annualLease / 12
  const hasHighYieldOpportunity = eventDates.length > 0

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">The Engine</h2>
        <p className="text-slate-400">Abbey Point Hotel & Car Park Operations</p>
      </div>

      {/* Hotel Lease Oversight */}
      {hotelAsset && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Abbey Point Hotel</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Annual Lease (Triple Net)</p>
              <p className="text-2xl font-bold text-white">
                {formatGBP(annualLease)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Monthly Payment</p>
              <p className="text-2xl font-bold text-white">
                {formatGBP(monthlyLease)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Lease Type</p>
              <p className="text-lg font-semibold text-slate-300">Triple Net</p>
            </div>
          </div>

          {hotelAsset.revenues.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Projected Annual Revenue</p>
              <p className="text-xl font-semibold text-green-400">
                {formatGBP(hotelAsset.revenues[0].annual_revenue)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Net Operating Income: {formatGBP(hotelAsset.revenues[0].annual_revenue - annualLease)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Wembley Event Mode */}
      {carParkAsset && eventConfig && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Car className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Wembley Car Park - Event Mode</h3>
            </div>
            {hasHighYieldOpportunity && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">High Yield Opportunity</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Spaces</p>
              <p className="text-lg font-semibold text-white">
                {eventConfig.spaces || 15}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Normal Daily Rate</p>
              <p className="text-lg font-semibold text-white">
                £{eventConfig.normal_daily_rate}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Event Daily Rate</p>
              <p className="text-lg font-semibold text-amber-400">
                £{eventConfig.event_daily_rate}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Upcoming Events</p>
              <p className="text-lg font-semibold text-white">
                {eventDates.length}
              </p>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Projected Monthly Yield</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {formatGBP(projectedYield)}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Based on {eventDates.length} event day{eventDates.length !== 1 ? 's' : ''} this month
            </p>
          </div>

          {eventDates.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm font-medium text-white mb-3">Upcoming Event Dates</p>
              <div className="space-y-2">
                {eventDates.slice(0, 5).map((date, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white">
                      {new Date(date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="ml-auto text-xs text-amber-400 font-medium">
                      £{eventConfig.event_daily_rate * (eventConfig.spaces || 15)} potential
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

