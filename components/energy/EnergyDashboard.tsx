'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  Thermometer, 
  TrendingDown, 
  Leaf,
  Sun,
  Moon,
  RefreshCw,
  ChevronRight,
  Power,
  DollarSign,
  Activity
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface EnergyMetrics {
  kwhSavedToday: number
  costSavedToday: number
  co2SavedToday: number
  activeInterventions: number
  roomsInEcoMode: number
  roomsPreheated: number
  gridArbitrageEvents: number
  currentGridPrice: number
  avgGridPrice: number
  isLowGridPrice: boolean
}

interface RoomIntervention {
  roomNumber: string
  mode: 'ECO' | 'COMFORT' | 'PREHEAT'
  currentTemp: number
  targetTemp: number
  reason: string
  savedKwh: number
}

export function EnergyDashboard() {
  const [metrics, setMetrics] = useState<EnergyMetrics>({
    kwhSavedToday: 45.2,
    costSavedToday: 12.65,
    co2SavedToday: 9.5,
    activeInterventions: 4,
    roomsInEcoMode: 3,
    roomsPreheated: 1,
    gridArbitrageEvents: 2,
    currentGridPrice: 0.08,
    avgGridPrice: 0.28,
    isLowGridPrice: true,
  })

  const [interventions, setInterventions] = useState<RoomIntervention[]>([
    { roomNumber: '103', mode: 'ECO', currentTemp: 16, targetTemp: 16, reason: 'Vacant since 11:00', savedKwh: 4.2 },
    { roomNumber: '106', mode: 'ECO', currentTemp: 16, targetTemp: 16, reason: 'Vacant since 10:30', savedKwh: 5.1 },
    { roomNumber: '102', mode: 'ECO', currentTemp: 16, targetTemp: 16, reason: 'Checkout completed', savedKwh: 3.8 },
    { roomNumber: '104', mode: 'PREHEAT', currentTemp: 20, targetTemp: 21, reason: 'Guest arriving in 1h', savedKwh: 0 },
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        kwhSavedToday: prev.kwhSavedToday + Math.random() * 2,
        costSavedToday: prev.costSavedToday + Math.random() * 0.5,
      }))
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5 text-emerald-500" />
              Energy & Grid Agent
              <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-500 rounded-full">
                LIVE
              </span>
            </CardTitle>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-[var(--text-muted)] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Energy Saved */}
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-xs text-[var(--text-muted)]">Energy Saved</span>
              </div>
              <p className="text-2xl font-bold text-emerald-500">
                {metrics.kwhSavedToday.toFixed(1)} <span className="text-sm font-normal">kWh</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Today</p>
            </div>

            {/* Cost Saved */}
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-cyan-500" />
                </div>
                <span className="text-xs text-[var(--text-muted)]">Cost Saved</span>
              </div>
              <p className="text-2xl font-bold text-cyan-500">
                £{metrics.costSavedToday.toFixed(2)}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Today</p>
            </div>

            {/* CO2 Saved */}
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Leaf className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-xs text-[var(--text-muted)]">CO₂ Saved</span>
              </div>
              <p className="text-2xl font-bold text-green-500">
                {metrics.co2SavedToday.toFixed(1)} <span className="text-sm font-normal">kg</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Today</p>
            </div>

            {/* Active Interventions */}
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs text-[var(--text-muted)]">Interventions</span>
              </div>
              <p className="text-2xl font-bold text-amber-500">
                {metrics.activeInterventions}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Active Now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grid Price Status */}
        <Card className="border-[var(--border-primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Power className="w-4 h-4 text-[var(--accent)]" />
              Grid Price Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)]">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Current Price</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold ${
                    metrics.isLowGridPrice ? 'text-green-500' : 'text-amber-500'
                  }`}>
                    £{metrics.currentGridPrice.toFixed(3)}
                  </p>
                  <span className="text-sm text-[var(--text-muted)]">/kWh</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Average: £{metrics.avgGridPrice.toFixed(3)}/kWh
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                metrics.isLowGridPrice 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-amber-500/10 text-amber-500'
              }`}>
                {metrics.isLowGridPrice ? (
                  <div className="text-center">
                    <Moon className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs font-medium">OFF-PEAK</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Sun className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs font-medium">PEAK</p>
                  </div>
                )}
              </div>
            </div>

            {metrics.isLowGridPrice && (
              <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-500 font-medium">
                    Arbitrage Active: Immersion heater enabled
                  </p>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Saving £{((metrics.avgGridPrice - metrics.currentGridPrice) * 10).toFixed(2)} per 10kWh vs average
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-lg font-bold text-[var(--text-primary)]">{metrics.roomsInEcoMode}</p>
                <p className="text-xs text-[var(--text-muted)]">Eco Mode</p>
              </div>
              <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-lg font-bold text-[var(--text-primary)]">{metrics.roomsPreheated}</p>
                <p className="text-xs text-[var(--text-muted)]">Pre-heated</p>
              </div>
              <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-lg font-bold text-[var(--text-primary)]">{metrics.gridArbitrageEvents}</p>
                <p className="text-xs text-[var(--text-muted)]">Arbitrage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Room Interventions */}
        <Card className="border-[var(--border-primary)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Thermometer className="w-4 h-4 text-[var(--accent)]" />
              Active HVAC Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interventions.map((room, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border-l-4 ${
                    room.mode === 'ECO' 
                      ? 'bg-blue-500/5 border-blue-500' 
                      : 'bg-amber-500/5 border-amber-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        room.mode === 'ECO' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                      }`}>
                        <Thermometer className={`w-4 h-4 ${
                          room.mode === 'ECO' ? 'text-blue-500' : 'text-amber-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--text-primary)]">
                            Room {room.roomNumber}
                          </p>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                            room.mode === 'ECO' 
                              ? 'bg-blue-500/10 text-blue-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {room.mode}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{room.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)]">
                        {room.currentTemp}°C → {room.targetTemp}°C
                      </p>
                      {room.savedKwh > 0 && (
                        <p className="text-xs text-emerald-500">
                          -{room.savedKwh.toFixed(1)} kWh saved
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Next agent run in</span>
                <span className="font-medium text-[var(--text-primary)]">8 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <Card className="border-[var(--border-primary)]">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-[var(--text-muted)]">This Week</p>
                <p className="text-lg font-bold text-emerald-500">312 kWh saved</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">This Month</p>
                <p className="text-lg font-bold text-cyan-500">£245.80 saved</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">YTD Carbon</p>
                <p className="text-lg font-bold text-green-500">1.2 tonnes CO₂</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
              <span className="text-sm text-[var(--text-primary)]">View Full Report</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

