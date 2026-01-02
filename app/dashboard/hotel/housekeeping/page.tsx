'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Bed,
  RefreshCw,
  Filter
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { units, bookings, properties } from '@/lib/mock-data/seed'

type HousekeepingStatus = 'DIRTY' | 'CLEANING' | 'INSPECTED' | 'READY'

interface HousekeepingRoom {
  unitId: string
  unitNumber: string
  type: string | undefined
  status: HousekeepingStatus
  assignedTo?: string
  checkoutTime?: Date
  targetTime?: Date
  notes?: string
}

// Generate housekeeping data from units
const generateHousekeepingData = (): HousekeepingRoom[] => {
  const hotelProperty = properties.find(p => p.type === 'HOTEL')
  const hotelUnits = units.filter(u => u.propertyId === hotelProperty?.id)
  
  return hotelUnits.map(unit => {
    // Check for checkouts today
    const todayCheckout = bookings.find(b => {
      const checkoutDate = new Date(b.checkOut)
      const today = new Date()
      return b.unitId === unit.id && 
             b.status === 'CHECKED_OUT' &&
             checkoutDate.toDateString() === today.toDateString()
    })

    // Determine housekeeping status based on unit status
    let hkStatus: HousekeepingStatus = 'READY'
    let assignedTo: string | undefined
    
    if (unit.status === 'MAINTENANCE') {
      hkStatus = 'DIRTY'
    } else if (todayCheckout) {
      const rand = Math.random()
      if (rand < 0.3) {
        hkStatus = 'DIRTY'
      } else if (rand < 0.6) {
        hkStatus = 'CLEANING'
        assignedTo = ['Maria', 'Elena', 'Sofia'][Math.floor(Math.random() * 3)]
      } else if (rand < 0.8) {
        hkStatus = 'INSPECTED'
      } else {
        hkStatus = 'READY'
      }
    } else if (unit.status === 'VACANT') {
      hkStatus = 'READY'
    } else {
      // Occupied rooms don't need immediate cleaning
      hkStatus = 'READY'
    }

    return {
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      type: unit.type,
      status: hkStatus,
      assignedTo,
      checkoutTime: todayCheckout ? new Date(todayCheckout.checkOut) : undefined,
      targetTime: hkStatus !== 'READY' ? new Date(Date.now() + 2 * 60 * 60 * 1000) : undefined,
    }
  })
}

const housekeepingRooms = generateHousekeepingData()

export default function HousekeepingPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<HousekeepingRoom[]>(housekeepingRooms)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [filter, setFilter] = useState<HousekeepingStatus | 'ALL'>('ALL')

  const statusConfig: Record<HousekeepingStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    DIRTY: { 
      label: 'Dirty', 
      color: 'text-red-500', 
      bgColor: 'bg-red-500/10 border-red-500/30',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    CLEANING: { 
      label: 'Cleaning in Progress', 
      color: 'text-amber-500', 
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      icon: <Sparkles className="w-4 h-4" />
    },
    INSPECTED: { 
      label: 'Inspected', 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      icon: <CheckCircle className="w-4 h-4" />
    },
    READY: { 
      label: 'Ready', 
      color: 'text-green-500', 
      bgColor: 'bg-green-500/10 border-green-500/30',
      icon: <CheckCircle className="w-4 h-4" />
    },
  }

  const updateRoomStatus = (unitId: string, newStatus: HousekeepingStatus) => {
    setRooms(prev => prev.map(room => 
      room.unitId === unitId ? { ...room, status: newStatus } : room
    ))
  }

  const getNextStatus = (current: HousekeepingStatus): HousekeepingStatus | null => {
    const flow: HousekeepingStatus[] = ['DIRTY', 'CLEANING', 'INSPECTED', 'READY']
    const currentIndex = flow.indexOf(current)
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null
  }

  const filteredRooms = filter === 'ALL' ? rooms : rooms.filter(r => r.status === filter)
  const roomsByStatus = (status: HousekeepingStatus) => rooms.filter(r => r.status === status)

  // Calculate stats
  const stats = {
    dirty: rooms.filter(r => r.status === 'DIRTY').length,
    cleaning: rooms.filter(r => r.status === 'CLEANING').length,
    inspected: rooms.filter(r => r.status === 'INSPECTED').length,
    ready: rooms.filter(r => r.status === 'READY').length,
  }

  const turnaroundTarget = 45 // minutes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[var(--accent)]" />
              Housekeeping Schedule
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Manage room turnaround and cleaning status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm rounded ${viewMode === 'kanban' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded ${viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'}`}
            >
              List
            </button>
          </div>
          <button 
            onClick={() => setRooms(generateHousekeepingData())}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status} className={`border ${config.bgColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={config.color}>
                  {config.icon}
                </div>
                <span className={`text-2xl font-bold ${config.color}`}>
                  {stats[status.toLowerCase() as keyof typeof stats]}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-1">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Turnaround Time Target */}
      <Card className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Target Turnaround Time</p>
              <p className="text-xs text-[var(--text-muted)]">Time from checkout to room ready</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[var(--accent)]">{turnaroundTarget}</span>
            <span className="text-sm text-[var(--text-muted)]"> minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(Object.keys(statusConfig) as HousekeepingStatus[]).map(status => (
            <div key={status} className="space-y-3">
              <div className={`p-3 rounded-lg ${statusConfig[status].bgColor} border`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${statusConfig[status].color}`}>
                    {statusConfig[status].label}
                  </span>
                  <span className={`text-sm font-bold ${statusConfig[status].color}`}>
                    {roomsByStatus(status).length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 min-h-[200px]">
                {roomsByStatus(status).map(room => (
                  <Card 
                    key={room.unitId}
                    className="cursor-pointer hover:border-[var(--accent)] transition-colors"
                    onClick={() => {
                      const next = getNextStatus(room.status)
                      if (next) updateRoomStatus(room.unitId, next)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[var(--text-primary)]">{room.unitNumber}</span>
                        <span className="text-xs text-[var(--text-muted)]">{room.type}</span>
                      </div>
                      {room.assignedTo && (
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <User className="w-3 h-3" />
                          {room.assignedTo}
                        </div>
                      )}
                      {room.checkoutTime && (
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-1">
                          <Clock className="w-3 h-3" />
                          Checkout: {room.checkoutTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {room.status !== 'READY' && (
                        <div className="mt-2 pt-2 border-t border-[var(--border-primary)]">
                          <p className="text-xs text-[var(--accent)]">
                            Click to advance →
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Rooms</CardTitle>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as HousekeepingStatus | 'ALL')}
                className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm"
              >
                <option value="ALL">All Status</option>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredRooms.map(room => (
                <div 
                  key={room.unitId}
                  className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="font-bold text-[var(--text-primary)]">{room.unitNumber}</span>
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">{room.type}</span>
                    {room.assignedTo && (
                      <span className="text-xs px-2 py-0.5 bg-[var(--bg-tertiary)] rounded">
                        {room.assignedTo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded ${statusConfig[room.status].bgColor} ${statusConfig[room.status].color}`}>
                      {statusConfig[room.status].label}
                    </span>
                    {room.status !== 'READY' && (
                      <button
                        onClick={() => {
                          const next = getNextStatus(room.status)
                          if (next) updateRoomStatus(room.unitId, next)
                        }}
                        className="px-3 py-1 text-xs bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)]"
                      >
                        Advance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

