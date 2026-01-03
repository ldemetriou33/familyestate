/**
 * Cloudbeds Webhook Handler
 * Listens for: reservation_created, checked_in, checked_out
 * Updates: Booking and HotelMetric tables
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { validateCloudbedsSignature } from '@/lib/webhooks'
import { BookingStatus, BookingChannel, DataSource, WebhookProvider, WebhookStatus } from '@prisma/client'

// Lazy import Prisma to avoid build-time initialization
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// Cloudbeds webhook secret (set in environment)
const CLOUDBEDS_WEBHOOK_SECRET = process.env.CLOUDBEDS_WEBHOOK_SECRET || ''

// Map Cloudbeds status to our BookingStatus
const statusMap: Record<string, BookingStatus> = {
  'confirmed': BookingStatus.CONFIRMED,
  'checked_in': BookingStatus.CHECKED_IN,
  'checked_out': BookingStatus.CHECKED_OUT,
  'cancelled': BookingStatus.CANCELLED,
  'no_show': BookingStatus.NO_SHOW,
}

// Map Cloudbeds source to our BookingChannel
const channelMap: Record<string, BookingChannel> = {
  'booking.com': BookingChannel.BOOKING_COM,
  'expedia': BookingChannel.EXPEDIA,
  'airbnb': BookingChannel.AIRBNB,
  'direct': BookingChannel.DIRECT,
  'website': BookingChannel.DIRECT,
  'phone': BookingChannel.PHONE,
}

interface CloudbedsReservationPayload {
  event: string
  timestamp: string
  data: {
    reservationId: string
    propertyId: string
    roomId: string
    roomName?: string
    guestName: string
    guestEmail?: string
    guestPhone?: string
    adults?: number
    children?: number
    checkInDate: string
    checkOutDate: string
    status: string
    source?: string
    totalAmount: number
    balanceDue?: number
    depositPaid?: number
    nightlyRate?: number
    notes?: string
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let logId: string | null = null
  
  // Get Prisma client lazily
  const prisma = await getPrisma()
  
  try {
    // Get raw body for signature validation
    const rawBody = await request.text()
    const signature = request.headers.get('x-cloudbeds-signature')
    const userAgent = request.headers.get('user-agent')
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    
    // Parse the payload
    let payload: CloudbedsReservationPayload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }
    
    // Log the incoming webhook
    const log = await prisma.integrationLog.create({
      data: {
        provider: WebhookProvider.CLOUDBEDS,
        eventType: payload.event || 'unknown',
        payload: payload as object,
        headers: Object.fromEntries(request.headers.entries()),
        signature: signature || undefined,
        status: WebhookStatus.RECEIVED,
        ipAddress: ip || undefined,
        userAgent: userAgent || undefined,
      },
    })
    logId = log.id
    
    // Validate signature (skip in development if no secret set)
    if (CLOUDBEDS_WEBHOOK_SECRET) {
      const isValid = validateCloudbedsSignature(rawBody, signature, CLOUDBEDS_WEBHOOK_SECRET)
      if (!isValid) {
        await prisma.integrationLog.update({
          where: { id: logId },
          data: {
            status: WebhookStatus.FAILED,
            errorMessage: 'Invalid signature',
          },
        })
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }
    
    // Process based on event type
    const eventType = payload.event?.toLowerCase()
    const data = payload.data
    
    if (!data || !data.reservationId) {
      await prisma.integrationLog.update({
        where: { id: logId },
        data: {
          status: WebhookStatus.IGNORED,
          errorMessage: 'Missing reservation data',
        },
      })
      return NextResponse.json({ status: 'ignored', reason: 'no reservation data' })
    }
    
    let linkedRecordId: string | null = null
    
    switch (eventType) {
      case 'reservation_created':
      case 'reservation_updated':
        linkedRecordId = await handleReservationUpsert(data)
        break
        
      case 'checked_in':
        linkedRecordId = await handleCheckIn(data)
        break
        
      case 'checked_out':
        linkedRecordId = await handleCheckOut(data)
        break
        
      default:
        await prisma.integrationLog.update({
          where: { id: logId },
          data: {
            status: WebhookStatus.IGNORED,
            errorMessage: `Unknown event type: ${eventType}`,
          },
        })
        return NextResponse.json({ status: 'ignored', reason: 'unknown event type' })
    }
    
    // Update log with success
    await prisma.integrationLog.update({
      where: { id: logId },
      data: {
        status: WebhookStatus.PROCESSED,
        processedAt: new Date(),
        linkedRecordType: 'Booking',
        linkedRecordId: linkedRecordId || undefined,
      },
    })
    
    const processingTime = Date.now() - startTime
    return NextResponse.json({
      status: 'processed',
      event: eventType,
      reservationId: data.reservationId,
      processingTimeMs: processingTime,
    })
    
  } catch (error) {
    console.error('Cloudbeds webhook error:', error)
    
    // Update log with error
    if (logId) {
      await prisma.integrationLog.update({
        where: { id: logId },
        data: {
          status: WebhookStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// HANDLER FUNCTIONS
// ============================================

async function handleReservationUpsert(data: CloudbedsReservationPayload['data']): Promise<string | null> {
  const prisma = await getPrisma()
  // Find unit by room name or use default hotel unit
  const unit = await prisma.unit.findFirst({
    where: {
      OR: [
        { unitNumber: data.roomName || '' },
        { unitNumber: data.roomId },
      ],
    },
  })
  
  if (!unit) {
    console.warn('No matching unit found for Cloudbeds room:', data.roomId, data.roomName)
    // Could create a default unit or skip
    return null
  }
  
  const checkIn = new Date(data.checkInDate)
  const checkOut = new Date(data.checkOutDate)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  
  const booking = await prisma.booking.upsert({
    where: {
      cloudbedsReservationId: data.reservationId,
    },
    create: {
      unitId: unit.id,
      cloudbedsReservationId: data.reservationId,
      cloudbedsPropertyId: data.propertyId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      adults: data.adults || 1,
      children: data.children || 0,
      checkIn,
      checkOut,
      nights,
      channel: channelMap[data.source?.toLowerCase() || 'direct'] || BookingChannel.DIRECT,
      status: statusMap[data.status?.toLowerCase() || 'confirmed'] || BookingStatus.CONFIRMED,
      roomRate: data.nightlyRate || (data.totalAmount / Math.max(nights, 1)),
      totalPrice: data.totalAmount,
      deposit: data.depositPaid || 0,
      balance: data.balanceDue || data.totalAmount,
      specialRequests: data.notes,
      dataSource: DataSource.PMS_CLOUDBEDS,
      lastUpdatedAt: new Date(),
    },
    update: {
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      adults: data.adults || 1,
      children: data.children || 0,
      checkIn,
      checkOut,
      nights,
      status: statusMap[data.status?.toLowerCase() || 'confirmed'] || BookingStatus.CONFIRMED,
      totalPrice: data.totalAmount,
      deposit: data.depositPaid || 0,
      balance: data.balanceDue || data.totalAmount,
      specialRequests: data.notes,
      lastUpdatedAt: new Date(),
    },
  })
  
  // Update daily hotel metrics
  await updateHotelMetrics(unit.propertyId, checkIn)
  
  return booking.id
}

async function handleCheckIn(data: CloudbedsReservationPayload['data']): Promise<string | null> {
  const prisma = await getPrisma()
  const booking = await prisma.booking.update({
    where: {
      cloudbedsReservationId: data.reservationId,
    },
    data: {
      status: BookingStatus.CHECKED_IN,
      lastUpdatedAt: new Date(),
    },
  })
  
  // Update unit status
  if (booking) {
    await prisma.unit.update({
      where: { id: booking.unitId },
      data: { status: 'OCCUPIED' },
    })
  }
  
  return booking?.id || null
}

async function handleCheckOut(data: CloudbedsReservationPayload['data']): Promise<string | null> {
  const prisma = await getPrisma()
  const booking = await prisma.booking.update({
    where: {
      cloudbedsReservationId: data.reservationId,
    },
    data: {
      status: BookingStatus.CHECKED_OUT,
      balance: 0, // Assume paid on checkout
      lastUpdatedAt: new Date(),
    },
  })
  
  // Update unit status to maintenance (needs cleaning)
  if (booking) {
    await prisma.unit.update({
      where: { id: booking.unitId },
      data: { status: 'MAINTENANCE' },
    })
  }
  
  return booking?.id || null
}

async function updateHotelMetrics(propertyId: string, date: Date): Promise<void> {
  const prisma = await getPrisma()
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  // Get all units for this property
  const units = await prisma.unit.findMany({
    where: { propertyId },
  })
  
  const totalRooms = units.length
  
  // Count bookings for this date
  const bookings = await prisma.booking.findMany({
    where: {
      unit: { propertyId },
      checkIn: { lte: endOfDay },
      checkOut: { gt: startOfDay },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
    },
  })
  
  const occupiedRooms = bookings.length
  const occupancy = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
  const revenue = bookings.reduce((sum, b) => sum + (b.roomRate || 0), 0)
  const adr = occupiedRooms > 0 ? revenue / occupiedRooms : 0
  const revpar = totalRooms > 0 ? revenue / totalRooms : 0
  
  await prisma.hotelMetric.upsert({
    where: {
      propertyId_date: {
        propertyId,
        date: startOfDay,
      },
    },
    create: {
      propertyId,
      date: startOfDay,
      roomsAvailable: totalRooms,
      roomsOccupied: occupiedRooms,
      occupancy,
      adr,
      revpar,
      totalRevenue: revenue,
      roomRevenue: revenue,
      dataSource: DataSource.PMS_CLOUDBEDS,
      lastUpdatedAt: new Date(),
    },
    update: {
      roomsAvailable: totalRooms,
      roomsOccupied: occupiedRooms,
      occupancy,
      adr,
      revpar,
      totalRevenue: revenue,
      roomRevenue: revenue,
      dataSource: DataSource.PMS_CLOUDBEDS,
      lastUpdatedAt: new Date(),
    },
  })
}

// Health check for the webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'cloudbeds-webhook',
    timestamp: new Date().toISOString(),
  })
}

