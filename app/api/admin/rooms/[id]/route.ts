// CMS Room API - Single room operations
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Get single room
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params

    const room = await prisma.cMSRoom.findUnique({
      where: { id },
      include: {
        property: true,
      },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Room GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}

// PUT - Update room
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const body = await request.json()

    // Recalculate event price if relevant fields changed
    let eventPrice = undefined
    if (body.isEventPremiumActive !== undefined || body.basePrice !== undefined || body.eventPremiumMultiplier !== undefined) {
      const currentRoom = await prisma.cMSRoom.findUnique({ where: { id } })
      if (currentRoom) {
        const basePrice = body.basePrice !== undefined ? parseFloat(body.basePrice) : currentRoom.basePrice
        const multiplier = body.eventPremiumMultiplier !== undefined ? parseFloat(body.eventPremiumMultiplier) : currentRoom.eventPremiumMultiplier
        const isActive = body.isEventPremiumActive !== undefined ? body.isEventPremiumActive : currentRoom.isEventPremiumActive
        
        eventPrice = isActive ? basePrice * multiplier : null
      }
    }

    const room = await prisma.cMSRoom.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.roomNumber !== undefined && { roomNumber: body.roomNumber }),
        ...(body.floor !== undefined && { floor: body.floor ? parseInt(body.floor) : null }),
        ...(body.roomType && { roomType: body.roomType }),
        ...(body.viewType && { viewType: body.viewType }),
        ...(body.bedType !== undefined && { bedType: body.bedType }),
        ...(body.maxOccupancy !== undefined && { maxOccupancy: parseInt(body.maxOccupancy) }),
        ...(body.squareMeters !== undefined && { squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null }),
        ...(body.basePrice !== undefined && { basePrice: parseFloat(body.basePrice) }),
        ...(body.weekendPrice !== undefined && { weekendPrice: body.weekendPrice ? parseFloat(body.weekendPrice) : null }),
        ...(body.isEventPremiumActive !== undefined && { isEventPremiumActive: body.isEventPremiumActive }),
        ...(body.eventPremiumMultiplier !== undefined && { eventPremiumMultiplier: parseFloat(body.eventPremiumMultiplier) }),
        ...(eventPrice !== undefined && { eventPrice }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.images && { images: body.images }),
        ...(body.heroImageUrl !== undefined && { heroImageUrl: body.heroImageUrl }),
        ...(body.amenities && { amenities: body.amenities }),
        ...(body.features && { features: body.features }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
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

    return NextResponse.json(room)
  } catch (error) {
    console.error('Room PUT error:', error)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

// DELETE - Delete room
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params

    await prisma.cMSRoom.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Room DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}

