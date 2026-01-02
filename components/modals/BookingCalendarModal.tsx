'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Users, Calendar, Bed, Plus } from 'lucide-react'
import { formatGBP, formatUKDate } from '@/lib/utils'
import { bookings, units, properties } from '@/lib/mock-data/seed'

interface BookingCalendarModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingCalendarModal({ isOpen, onClose }: BookingCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  
  if (!isOpen) return null

  const hotelProperty = properties.find(p => p.type === 'HOTEL')
  const hotelUnits = units.filter(u => u.propertyId === hotelProperty?.id)
  
  // Get days in the current month view (14 days from current date)
  const getDays = () => {
    const days = []
    for (let i = 0; i < 14; i++) {
      const day = new Date(currentDate)
      day.setDate(currentDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const days = getDays()

  const getBookingsForDay = (unitId: string, date: Date) => {
    return bookings.filter(b => {
      if (b.unitId !== unitId) return false
      const checkIn = new Date(b.checkIn)
      const checkOut = new Date(b.checkOut)
      checkIn.setHours(0, 0, 0, 0)
      checkOut.setHours(0, 0, 0, 0)
      const compareDate = new Date(date)
      compareDate.setHours(0, 0, 0, 0)
      return compareDate >= checkIn && compareDate < checkOut
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const selectedBookingData = selectedBooking ? bookings.find(b => b.id === selectedBooking) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Booking Calendar</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/20 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
              <span className="text-sm font-medium text-[var(--text-primary)] px-2">
                {formatUKDate(days[0])} - {formatUKDate(days[days.length - 1])}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="min-w-[900px]">
            {/* Day Headers */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${days.length}, minmax(60px, 1fr))` }}>
              <div className="p-2 text-xs font-medium text-[var(--text-muted)]">Room</div>
              {days.map((day, i) => {
                const isToday = new Date().toDateString() === day.toDateString()
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                return (
                  <div
                    key={i}
                    className={`p-2 text-center rounded-t-lg ${isToday ? 'bg-[var(--accent)]/10' : isWeekend ? 'bg-[var(--bg-secondary)]/50' : ''}`}
                  >
                    <p className={`text-xs font-medium ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                      {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </p>
                    <p className={`text-sm font-bold ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Room Rows */}
            {hotelUnits.map(unit => (
              <div
                key={unit.id}
                className="grid gap-1 border-t border-[var(--border-primary)]"
                style={{ gridTemplateColumns: `120px repeat(${days.length}, minmax(60px, 1fr))` }}
              >
                <div className="p-2 flex items-center gap-2">
                  <Bed className="w-4 h-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{unit.unitNumber}</p>
                    <p className="text-xs text-[var(--text-muted)]">{unit.type}</p>
                  </div>
                </div>
                {days.map((day, i) => {
                  const dayBookings = getBookingsForDay(unit.id, day)
                  const booking = dayBookings[0]
                  const isToday = new Date().toDateString() === day.toDateString()
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6

                  return (
                    <div
                      key={i}
                      className={`min-h-[50px] p-1 ${isToday ? 'bg-[var(--accent)]/5' : isWeekend ? 'bg-[var(--bg-secondary)]/30' : ''}`}
                    >
                      {booking ? (
                        <button
                          onClick={() => setSelectedBooking(booking.id)}
                          className={`w-full h-full p-1 rounded text-xs truncate transition-all hover:scale-105 ${
                            booking.status === 'CHECKED_IN' ? 'bg-green-500/30 text-green-400 border border-green-500/50' :
                            booking.status === 'CONFIRMED' ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50' :
                            'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                          }`}
                        >
                          {booking.guestName.split(' ')[0]}
                        </button>
                      ) : (
                        <button
                          className="w-full h-full p-1 rounded border border-dashed border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 border-t border-[var(--border-primary)] flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/50" />
            <span className="text-xs text-[var(--text-muted)]">Checked In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/40 border border-blue-500/50" />
            <span className="text-xs text-[var(--text-muted)]">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/50" />
            <span className="text-xs text-[var(--text-muted)]">Pending</span>
          </div>
          <div className="flex-1" />
          <button className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>

        {/* Booking Detail Sidebar */}
        {selectedBookingData && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--text-primary)]">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg"
              >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[var(--accent)]" />
                  <span className="font-medium text-[var(--text-primary)]">{selectedBookingData.guestName}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{selectedBookingData.guestEmail}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Check-In</span>
                  <span className="text-[var(--text-primary)]">{formatUKDate(new Date(selectedBookingData.checkIn))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Check-Out</span>
                  <span className="text-[var(--text-primary)]">{formatUKDate(new Date(selectedBookingData.checkOut))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    selectedBookingData.status === 'CHECKED_IN' ? 'bg-green-500/20 text-green-400' :
                    selectedBookingData.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedBookingData.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Channel</span>
                  <span className="text-[var(--text-primary)]">{selectedBookingData.channel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Total</span>
                  <span className="font-bold text-[var(--success)]">{formatGBP(selectedBookingData.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Balance</span>
                  <span className={`font-bold ${selectedBookingData.balance > 0 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                    {formatGBP(selectedBookingData.balance)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--border-primary)]">
                <button className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors">
                  Modify
                </button>
                <button className="flex-1 px-3 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent)]/90 transition-colors">
                  Check In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

