'use client'

import { useRouter } from 'next/navigation'
import { Hotel, Users, TrendingUp, Calendar, Bed, DollarSign, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatGBP, formatUKDate } from '@/lib/utils'
import { hotelMetrics, units, bookings, properties } from '@/lib/mock-data/seed'

export default function HotelSection() {
  const router = useRouter()
  const hotelProperty = properties.find(p => p.type === 'HOTEL')
  const hotelUnits = units.filter(u => u.propertyId === hotelProperty?.id)
  
  const occupiedRooms = hotelUnits.filter(u => u.status === 'OCCUPIED').length
  const vacantRooms = hotelUnits.filter(u => u.status === 'VACANT').length
  const maintenanceRooms = hotelUnits.filter(u => u.status === 'MAINTENANCE').length
  const totalRooms = hotelUnits.length

  // Today's arrivals and departures
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const arrivalsToday = bookings.filter(b => {
    const checkIn = new Date(b.checkIn)
    checkIn.setHours(0, 0, 0, 0)
    return checkIn.getTime() === today.getTime() && b.status === 'CONFIRMED'
  })

  const departuresToday = bookings.filter(b => {
    const checkOut = new Date(b.checkOut)
    checkOut.setHours(0, 0, 0, 0)
    return checkOut.getTime() === today.getTime() && b.status === 'CHECKED_IN'
  })

  const inHouseGuests = bookings.filter(b => b.status === 'CHECKED_IN')

  const handleRoomClick = (unitId: string) => {
    router.push(`/dashboard/hotel/rooms/${unitId}`)
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => router.push('/dashboard/hotel/housekeeping')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Housekeeping
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Booking Calendar
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          Rate Manager
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Hotel className="w-5 h-5 text-[var(--accent)]" />
              <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                Live
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Occupancy Rate</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{hotelMetrics.occupancyRate}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {occupiedRooms}/{totalRooms} rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-1">ADR (Avg Daily Rate)</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatGBP(hotelMetrics.adr)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">RevPAR: {formatGBP(hotelMetrics.revpar)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Revenue MTD</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatGBP(hotelMetrics.revenueMTD)}</p>
            <p className="text-xs text-green-500 mt-1">
              +12% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Today</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-green-500">{hotelMetrics.arrivalsToday}</p>
                <p className="text-xs text-[var(--text-muted)]">Arrivals</p>
              </div>
              <div className="w-px h-10 bg-[var(--border-primary)]" />
              <div>
                <p className="text-2xl font-bold text-amber-500">{hotelMetrics.departuresToday}</p>
                <p className="text-xs text-[var(--text-muted)]">Departures</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bed className="w-5 h-5 text-[var(--accent)]" />
              Room Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span className="text-sm text-[var(--text-primary)]">Occupied</span>
              <span className="text-lg font-bold text-green-500">{occupiedRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
              <span className="text-sm text-[var(--text-primary)]">Vacant</span>
              <span className="text-lg font-bold text-blue-500">{vacantRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
              <span className="text-sm text-[var(--text-primary)]">Maintenance</span>
              <span className="text-lg font-bold text-amber-500">{maintenanceRooms}</span>
            </div>
          </CardContent>
        </Card>

        {/* In-House Guests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-[var(--accent)]" />
              In-House Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inHouseGuests.map((booking) => {
                  const unit = units.find(u => u.id === booking.unitId)
                  return (
                    <TableRow 
                      key={booking.id}
                      className="cursor-pointer hover:bg-[var(--bg-secondary)]"
                      onClick={() => handleRoomClick(booking.unitId)}
                    >
                      <TableCell>
                        <span className="font-mono text-[var(--text-primary)]">{unit?.unitNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[var(--text-primary)]">{booking.guestName}</span>
                      </TableCell>
                      <TableCell className="text-[var(--text-muted)]">
                        {formatUKDate(new Date(booking.checkIn))}
                      </TableCell>
                      <TableCell className="text-[var(--text-muted)]">
                        {formatUKDate(new Date(booking.checkOut))}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono ${booking.balance > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                          {formatGBP(booking.balance)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Room Grid Visual - Clickable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Room Grid</span>
            <span className="text-xs text-[var(--text-muted)] font-normal">Click any room for details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {hotelUnits.map((unit) => {
              const statusColors = {
                OCCUPIED: 'bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30',
                VACANT: 'bg-blue-500/20 border-blue-500 text-blue-500 hover:bg-blue-500/30',
                MAINTENANCE: 'bg-amber-500/20 border-amber-500 text-amber-500 hover:bg-amber-500/30',
              }

              return (
                <button
                  key={unit.id}
                  onClick={() => handleRoomClick(unit.id)}
                  className={`p-3 rounded-lg border text-center cursor-pointer hover:scale-105 transition-all ${statusColors[unit.status]}`}
                  title={`${unit.unitNumber} - ${unit.type} - ${unit.status}`}
                >
                  <p className="text-sm font-bold">{unit.unitNumber}</p>
                  <p className="text-xs opacity-70">{unit.type}</p>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--border-primary)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/40" />
              <span className="text-xs text-[var(--text-muted)]">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/40" />
              <span className="text-xs text-[var(--text-muted)]">Vacant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/40" />
              <span className="text-xs text-[var(--text-muted)]">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
