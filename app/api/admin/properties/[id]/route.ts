// CMS Property API - Single property operations
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Get single property
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params

    const property = await prisma.cMSProperty.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Property GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}

// PUT - Update property
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const body = await request.json()

    // If changing name, update slug
    let slug = undefined
    if (body.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if new slug conflicts with another property
      const existing = await prisma.cMSProperty.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      })
      if (existing) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const property = await prisma.cMSProperty.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(slug && { slug }),
        ...(body.location && { location: body.location }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.assetType && { assetType: body.assetType }),
        ...(body.status && { status: body.status }),
        ...(body.purchaseDate !== undefined && { 
          purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null 
        }),
        ...(body.purchasePrice !== undefined && { 
          purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null 
        }),
        ...(body.currentValue !== undefined && { 
          currentValue: body.currentValue ? parseFloat(body.currentValue) : null 
        }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.heroImageUrl !== undefined && { heroImageUrl: body.heroImageUrl }),
        ...(body.galleryImages && { galleryImages: body.galleryImages }),
        ...(body.amenities && { amenities: body.amenities }),
        ...(body.highlights && { highlights: body.highlights }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.latitude !== undefined && { 
          latitude: body.latitude ? parseFloat(body.latitude) : null 
        }),
        ...(body.longitude !== undefined && { 
          longitude: body.longitude ? parseFloat(body.longitude) : null 
        }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.isPublished !== undefined && { 
          isPublished: body.isPublished,
          publishedAt: body.isPublished ? new Date() : null,
        }),
      },
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Property PUT error:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

// DELETE - Delete property
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params

    await prisma.cMSProperty.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Property DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}

