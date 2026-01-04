import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // If Supabase not configured, allow access (for development)
      return response
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Check if user is admin
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean)

    if (adminEmails.length === 0) {
      // No admin emails configured, allow access (for development)
      return response
    }

    if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}

