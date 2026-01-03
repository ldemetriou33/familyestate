// Admin Auth API - Check if current user is admin (Supabase Auth)
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getAdminUser()
    
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ isAdmin: false, error: 'Authentication failed' }, { status: 500 })
  }
}

