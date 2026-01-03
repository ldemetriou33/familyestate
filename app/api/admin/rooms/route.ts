// CMS Rooms API - Full CRUD with Event Mode
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

// GET - List all rooms
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const eventMode = searchParams.get('eventMode')
    
    const where: Record<string, unknown> = {}
    if (propertyId) where.propertyId = propertyId
    if (eventMode === 'true') where.isEventPremiumActive = true

    const rooms = await prisma.cMSRoom.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            location: true,
          }
        }
      },
      orderBy: [
        { propertyId: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Rooms GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST - Create new room
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    
    // Calculate event price if premium is active
    const eventPrice = body.isEventPremiumActive 
      ? body.basePrice * (body.eventPremiumMultiplier || 1.5)
      : null

    const room = await prisma.cMSRoom.create({
      data: {
        propertyId: body.propertyId,
        name: body.name,
        roomNumber: body.roomNumber,
        floor: body.floor ? parseInt(body.floor) : null,
        roomType: body.roomType || 'Standard',
        viewType: body.viewType || 'STANDARD',
        bedType: body.bedType,
        maxOccupancy: body.maxOccupancy ? parseInt(body.maxOccupancy) : 2,
        squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null,
        basePrice: parseFloat(body.basePrice),
        weekendPrice: body.weekendPrice ? parseFloat(body.weekendPrice) : null,
        isEventPremiumActive: body.isEventPremiumActive || false,
        eventPremiumMultiplier: body.eventPremiumMultiplier ? parseFloat(body.eventPremiumMultiplier) : 1.5,
        eventPrice,
        description: body.description,
        images: body.images || [],
        heroImageUrl: body.heroImageUrl,
        amenities: body.amenities || [],
        features: body.features || [],
        isAvailable: body.isAvailable ?? true,
        isPublished: body.isPublished ?? true,
        sortOrder: body.sortOrder || 0,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Rooms POST error:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

// PATCH - Bulk update rooms (for event mode toggle)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { roomIds, updates } = body

    if (!roomIds || !Array.isArray(roomIds)) {
      return NextResponse.json({ error: 'roomIds must be an array' }, { status: 400 })
    }

    // If toggling event mode, recalculate event prices
    if (updates.isEventPremiumActive !== undefined) {
      const rooms = await prisma.cMSRoom.findMany({
        where: { id: { in: roomIds } },
        select: { id: true, basePrice: true, eventPremiumMultiplier: true }
      })

      for (const room of rooms) {
        const eventPrice = updates.isEventPremiumActive
          ? room.basePrice * room.eventPremiumMultiplier
          : null

        await prisma.cMSRoom.update({
          where: { id: room.id },
          data: {
            isEventPremiumActive: updates.isEventPremiumActive,
            eventPrice,
          }
        })
      }

      return NextResponse.json({ updated: rooms.length })
    }

    // Generic bulk update
    await prisma.cMSRoom.updateMany({
      where: { id: { in: roomIds } },
      data: updates,
    })

    return NextResponse.json({ updated: roomIds.length })
  } catch (error) {
    console.error('Rooms PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update rooms' }, { status: 500 })
  }
}

