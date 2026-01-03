// Public Properties API - Fetch published properties for the public site
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured')
    const assetType = searchParams.get('type')
    
    // Single property by slug
    if (slug) {
      const property = await prisma.cMSProperty.findFirst({
        where: { 
          slug,
          isPublished: true,
          status: { not: 'ARCHIVED' }
        },
        include: {
          rooms: {
            where: { isPublished: true },
            orderBy: { sortOrder: 'asc' },
          }
        }
      })

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }

      return NextResponse.json(property)
    }

    // List properties
    const where: Record<string, unknown> = {
      isPublished: true,
      status: { not: 'ARCHIVED' }
    }
    
    if (featured === 'true') where.isFeatured = true
    if (assetType) where.assetType = assetType

    const properties = await prisma.cMSProperty.findMany({
      where,
      include: {
        rooms: {
          where: { isPublished: true },
          select: {
            id: true,
            name: true,
            basePrice: true,
            eventPrice: true,
            isEventPremiumActive: true,
            viewType: true,
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    // Separate active and sold properties for "Past Projects" section
    const active = properties.filter(p => p.status === 'ACTIVE' || p.status === 'DEVELOPMENT' || p.status === 'MAINTENANCE')
    const sold = properties.filter(p => p.status === 'SOLD')

    return NextResponse.json({
      properties: active,
      pastProjects: sold,
      total: properties.length,
    })
  } catch (error) {
    console.error('Public properties error:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

