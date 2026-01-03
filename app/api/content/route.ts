// Public Content API - Fetch site content for the public site
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const section = searchParams.get('section')
    const keys = searchParams.get('keys') // Comma-separated list

    // Single key lookup
    if (key) {
      const content = await prisma.siteContent.findUnique({
        where: { key },
        select: { key: true, value: true, contentType: true }
      })

      if (!content) {
        return NextResponse.json({ key, value: '' })
      }

      return NextResponse.json(content)
    }

    // Multiple keys lookup
    if (keys) {
      const keyList = keys.split(',').map(k => k.trim())
      const content = await prisma.siteContent.findMany({
        where: { key: { in: keyList } },
        select: { key: true, value: true, contentType: true }
      })

      // Convert to key-value object
      const result: Record<string, string> = {}
      content.forEach(item => {
        result[item.key] = item.value
      })

      return NextResponse.json(result)
    }

    // Section lookup
    if (section) {
      const content = await prisma.siteContent.findMany({
        where: { section },
        select: { key: true, value: true, contentType: true }
      })

      // Convert to key-value object
      const result: Record<string, string> = {}
      content.forEach(item => {
        result[item.key] = item.value
      })

      return NextResponse.json(result)
    }

    // All content (for SSG)
    const content = await prisma.siteContent.findMany({
      select: { key: true, value: true, contentType: true, section: true }
    })

    // Convert to key-value object
    const result: Record<string, string> = {}
    content.forEach(item => {
      result[item.key] = item.value
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Public content error:', error)
    // Return empty object on error to prevent site breakage
    return NextResponse.json({})
  }
}

