// Admin Auth API - Check if current user is admin (Supabase Auth)
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not set')
      return NextResponse.json({ isAdmin: false, error: 'Supabase not configured' }, { status: 503 })
    }

    const user = await getAdminUser()
    
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Admin auth error:', error)
    // Don't throw - return a safe response
    return NextResponse.json({ 
      isAdmin: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }, { status: 500 })
  }
}

