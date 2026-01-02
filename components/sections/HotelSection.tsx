'use client'

import { Hotel, Users, TrendingUp, Calendar, Bed, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatGBP, formatUKDate } from '@/lib/utils'
import { hotelMetrics, units, bookings, properties } from '@/lib/mock-data/seed'

export default function HotelSection() {
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

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Hotel className="w-5 h-5 text-bloomberg-accent" />
              <span className="text-xs px-2 py-0.5 bg-bloomberg-success/10 text-bloomberg-success rounded-full">
                Live
              </span>
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">Occupancy Rate</p>
            <p className="text-2xl font-bold text-bloomberg-text">{hotelMetrics.occupancyRate}%</p>
            <p className="text-xs text-bloomberg-textMuted mt-1">
              {occupiedRooms}/{totalRooms} rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-5 h-5 text-bloomberg-success" />
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">ADR (Avg Daily Rate)</p>
            <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(hotelMetrics.adr)}</p>
            <p className="text-xs text-bloomberg-textMuted mt-1">RevPAR: {formatGBP(hotelMetrics.revpar)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-bloomberg-success" />
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">Revenue MTD</p>
            <p className="text-2xl font-bold text-bloomberg-text">{formatGBP(hotelMetrics.revenueMTD)}</p>
            <p className="text-xs text-bloomberg-success mt-1">
              +12% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-5 h-5 text-bloomberg-accent" />
            </div>
            <p className="text-sm text-bloomberg-textMuted mb-1">Today</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-bloomberg-success">{hotelMetrics.arrivalsToday}</p>
                <p className="text-xs text-bloomberg-textMuted">Arrivals</p>
              </div>
              <div className="w-px h-10 bg-bloomberg-border" />
              <div>
                <p className="text-2xl font-bold text-bloomberg-warning">{hotelMetrics.departuresToday}</p>
                <p className="text-xs text-bloomberg-textMuted">Departures</p>
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
              <Bed className="w-5 h-5 text-bloomberg-accent" />
              Room Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-bloomberg-success/10 rounded-lg">
              <span className="text-sm text-bloomberg-text">Occupied</span>
              <span className="text-lg font-bold text-bloomberg-success">{occupiedRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-bloomberg-accent/10 rounded-lg">
              <span className="text-sm text-bloomberg-text">Vacant</span>
              <span className="text-lg font-bold text-bloomberg-accent">{vacantRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-bloomberg-warning/10 rounded-lg">
              <span className="text-sm text-bloomberg-text">Maintenance</span>
              <span className="text-lg font-bold text-bloomberg-warning">{maintenanceRooms}</span>
            </div>
          </CardContent>
        </Card>

        {/* In-House Guests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-bloomberg-accent" />
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
                    <TableRow key={booking.id}>
                      <TableCell>
                        <span className="font-mono text-bloomberg-text">{unit?.unitNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-bloomberg-text">{booking.guestName}</span>
                      </TableCell>
                      <TableCell className="text-bloomberg-textMuted">
                        {formatUKDate(new Date(booking.checkIn))}
                      </TableCell>
                      <TableCell className="text-bloomberg-textMuted">
                        {formatUKDate(new Date(booking.checkOut))}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono ${booking.balance > 0 ? 'text-bloomberg-warning' : 'text-bloomberg-success'}`}>
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

      {/* Room Grid Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Room Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {hotelUnits.map((unit) => {
              const statusColors = {
                OCCUPIED: 'bg-bloomberg-success/20 border-bloomberg-success text-bloomberg-success',
                VACANT: 'bg-bloomberg-accent/20 border-bloomberg-accent text-bloomberg-accent',
                MAINTENANCE: 'bg-bloomberg-warning/20 border-bloomberg-warning text-bloomberg-warning',
              }

              return (
                <div
                  key={unit.id}
                  className={`p-3 rounded-lg border text-center cursor-pointer hover:scale-105 transition-transform ${statusColors[unit.status]}`}
                  title={`${unit.unitNumber} - ${unit.type} - ${unit.status}`}
                >
                  <p className="text-sm font-bold">{unit.unitNumber}</p>
                  <p className="text-xs opacity-70">{unit.type}</p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-bloomberg-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-bloomberg-success/40" />
              <span className="text-xs text-bloomberg-textMuted">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-bloomberg-accent/40" />
              <span className="text-xs text-bloomberg-textMuted">Vacant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-bloomberg-warning/40" />
              <span className="text-xs text-bloomberg-textMuted">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

