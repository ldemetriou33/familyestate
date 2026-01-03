// Admin Stats API
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    // Get CMS stats
    const [
      totalProperties,
      activeProperties,
      soldProperties,
      totalRooms,
      eventModeRooms,
      contentItems,
    ] = await Promise.all([
      prisma.cMSProperty.count().catch(() => 0),
      prisma.cMSProperty.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      prisma.cMSProperty.count({ where: { status: 'SOLD' } }).catch(() => 0),
      prisma.cMSRoom.count().catch(() => 0),
      prisma.cMSRoom.count({ where: { isEventPremiumActive: true } }).catch(() => 0),
      prisma.siteContent.count().catch(() => 0),
    ])

    return NextResponse.json({
      totalProperties,
      activeProperties,
      soldProperties,
      totalRooms,
      eventModeRooms,
      contentItems,
      recentChanges: [], // TODO: Implement activity log
    })
  } catch (error) {
    console.error('Stats error:', error)
    // Return zeros if tables don't exist yet
    return NextResponse.json({
      totalProperties: 0,
      activeProperties: 0,
      soldProperties: 0,
      totalRooms: 0,
      eventModeRooms: 0,
      contentItems: 0,
      recentChanges: [],
    })
  }
}

