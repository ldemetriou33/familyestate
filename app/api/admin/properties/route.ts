// CMS Properties API - Full CRUD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

// GET - List all properties
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assetType = searchParams.get('type')
    
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (assetType) where.assetType = assetType

    const properties = await prisma.cMSProperty.findMany({
      where,
      include: {
        rooms: {
          select: {
            id: true,
            isEventPremiumActive: true,
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Properties GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    
    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    // Check if slug exists
    const existing = await prisma.cMSProperty.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const property = await prisma.cMSProperty.create({
      data: {
        name: body.name,
        slug: finalSlug,
        location: body.location,
        country: body.country || 'UK',
        assetType: body.assetType || 'HOTEL',
        status: body.status || 'ACTIVE',
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        currentValue: body.currentValue ? parseFloat(body.currentValue) : null,
        description: body.description,
        shortDescription: body.shortDescription,
        heroImageUrl: body.heroImageUrl,
        galleryImages: body.galleryImages || [],
        amenities: body.amenities || [],
        highlights: body.highlights || [],
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        sortOrder: body.sortOrder || 0,
        isFeatured: body.isFeatured || false,
        isPublished: body.isPublished || false,
        publishedAt: body.isPublished ? new Date() : null,
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Properties POST error:', error)
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}

