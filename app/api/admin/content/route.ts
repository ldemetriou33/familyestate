// CMS Site Content API - Key-Value Content System
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, getAdminUser } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

// GET - List all content items
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    
    const where: Record<string, unknown> = {}
    if (section) where.section = section

    const content = await prisma.siteContent.findMany({
      where,
      orderBy: [
        { section: 'asc' },
        { key: 'asc' },
      ],
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Content GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST - Create or update content item
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const user = await getAdminUser()
    
    const body = await request.json()
    
    // Upsert - create if doesn't exist, update if does
    const existing = await prisma.siteContent.findUnique({
      where: { key: body.key }
    })

    const content = await prisma.siteContent.upsert({
      where: { key: body.key },
      create: {
        key: body.key,
        value: body.value,
        section: body.section,
        contentType: body.contentType || 'text',
        label: body.label,
        description: body.description,
        lastEditedBy: user?.id,
      },
      update: {
        value: body.value,
        previousValue: existing?.value,
        version: { increment: 1 },
        section: body.section,
        contentType: body.contentType,
        label: body.label,
        description: body.description,
        lastEditedBy: user?.id,
      },
    })

    return NextResponse.json(content, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Content POST error:', error)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}

// PUT - Bulk update content items
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const user = await getAdminUser()
    
    const body = await request.json()
    const { items } = body // Array of { key, value }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array' }, { status: 400 })
    }

    const results = []
    for (const item of items) {
      const existing = await prisma.siteContent.findUnique({
        where: { key: item.key }
      })

      const updated = await prisma.siteContent.upsert({
        where: { key: item.key },
        create: {
          key: item.key,
          value: item.value,
          section: item.section,
          contentType: item.contentType || 'text',
          label: item.label,
          lastEditedBy: user?.id,
        },
        update: {
          value: item.value,
          previousValue: existing?.value,
          version: { increment: 1 },
          lastEditedBy: user?.id,
        },
      })
      results.push(updated)
    }

    return NextResponse.json({ updated: results.length, items: results })
  } catch (error) {
    console.error('Content PUT error:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

// DELETE - Delete content item
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    await prisma.siteContent.delete({
      where: { key },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Content DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}

