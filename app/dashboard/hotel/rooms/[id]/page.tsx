'use client'

import { use } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Bed, 
  User, 
  Calendar, 
  Clock, 
  DollarSign,
  Wrench,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatGBP, formatUKDate } from '@/lib/utils'
import { units, bookings, properties } from '@/lib/mock-data/seed'

interface PageProps {
  params: Promise<{ id: string }>
}

// Mock maintenance history
const maintenanceHistory = [
  { id: '1', date: new Date('2024-01-15'), type: 'Routine', description: 'Deep clean and inspection', cost: 85, status: 'COMPLETED' },
  { id: '2', date: new Date('2024-02-20'), type: 'Repair', description: 'Shower head replacement', cost: 45, status: 'COMPLETED' },
  { id: '3', date: new Date('2024-03-10'), type: 'Maintenance', description: 'HVAC filter change', cost: 25, status: 'COMPLETED' },
]

export default function RoomDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'history'>('overview')

  const unit = units.find(u => u.id === id)
  const property = properties.find(p => p.id === unit?.propertyId)
  
  // Find current booking if room is occupied
  const currentBooking = bookings.find(b => b.unitId === id && b.status === 'CHECKED_IN')
  
  // Find upcoming bookings
  const upcomingBookings = bookings.filter(b => 
    b.unitId === id && 
    b.status === 'CONFIRMED' && 
    new Date(b.checkIn) > new Date()
  ).slice(0, 3)

  // Past bookings
  const pastBookings = bookings.filter(b => 
    b.unitId === id && 
    b.status === 'CHECKED_OUT'
  ).slice(0, 5)

  if (!unit) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--text-muted)]">Room not found</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    )
  }

  const statusColors = {
    OCCUPIED: 'bg-green-500',
    VACANT: 'bg-blue-500',
    MAINTENANCE: 'bg-amber-500',
  }

  const getCheckoutTime = () => {
    if (currentBooking) {
      return new Date(currentBooking.checkOut).toLocaleTimeString('en-GB', { 
        hour: '2-digit', minute: '2-digit' 
      })
    }
    return '11:00'
  }

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
              <Bed className="w-6 h-6 text-[var(--accent)]" />
              Room {unit.unitNumber}
              <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${statusColors[unit.status]}`}>
                {unit.status}
              </span>
            </h1>
            <p className="text-sm text-[var(--text-muted)]">{property?.name} • {unit.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors">
            Edit Room
          </button>
          {unit.status === 'OCCUPIED' && (
            <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
              Check Out
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-primary)]">
        {(['overview', 'maintenance', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Guest / Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5 text-[var(--accent)]" />
                {currentBooking ? 'Current Guest' : 'Room Available'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentBooking ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{currentBooking.guestName}</p>
                      <p className="text-sm text-[var(--text-muted)]">{currentBooking.guestEmail}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-[var(--accent)]/10 rounded-lg hover:bg-[var(--accent)]/20">
                        <Phone className="w-4 h-4 text-[var(--accent)]" />
                      </button>
                      <button className="p-2 bg-[var(--accent)]/10 rounded-lg hover:bg-[var(--accent)]/20">
                        <Mail className="w-4 h-4 text-[var(--accent)]" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Check-In</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {formatUKDate(new Date(currentBooking.checkIn))}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Check-Out</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {formatUKDate(new Date(currentBooking.checkOut))} @ {getCheckoutTime()}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Total Spend</p>
                      <p className="text-sm font-bold text-[var(--success)]">
                        {formatGBP(currentBooking.totalPrice)}
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">Balance Due</p>
                      <p className={`text-sm font-bold ${currentBooking.balance > 0 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                        {formatGBP(currentBooking.balance)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Channel</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{currentBooking.channel.replace('_', ' ')}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-3" />
                  <p className="text-lg font-medium text-[var(--text-primary)]">Room is Available</p>
                  <p className="text-sm text-[var(--text-muted)]">Ready for next guest</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bed className="w-5 h-5 text-[var(--accent)]" />
                Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-muted)]">Type</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{unit.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-muted)]">Rate</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{formatGBP(unit.currentRate || 0)}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-muted)]">Floor</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{unit.floor || 'Ground'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-muted)]">Bedrooms</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{unit.bedrooms || 1}</span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-[var(--accent)]" />
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{booking.guestName}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatUKDate(new Date(booking.checkIn))} - {formatUKDate(new Date(booking.checkOut))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[var(--success)]">{formatGBP(booking.totalPrice)}</p>
                        <p className="text-xs text-[var(--text-muted)]">{booking.channel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--text-muted)] py-4">No upcoming bookings</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="w-5 h-5 text-[var(--accent)]" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'Repair' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Wrench className={`w-4 h-4 ${
                        item.type === 'Repair' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.description}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatUKDate(item.date)} • {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--text-primary)]">{formatGBP(item.cost)}</p>
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Total Maintenance Cost (YTD)</span>
              <span className="font-bold text-[var(--text-primary)]">
                {formatGBP(maintenanceHistory.reduce((sum, m) => sum + m.cost, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5 text-[var(--accent)]" />
              Booking History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastBookings.length > 0 ? (
              <div className="space-y-3">
                {pastBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{booking.guestName}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatUKDate(new Date(booking.checkIn))} - {formatUKDate(new Date(booking.checkOut))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[var(--success)]">{formatGBP(booking.totalPrice)}</p>
                      <span className="text-xs text-[var(--text-muted)]">{booking.channel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--text-muted)] py-4">No booking history</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

